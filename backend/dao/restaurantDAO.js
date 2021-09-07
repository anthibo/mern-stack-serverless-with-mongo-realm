
import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId
let restaurants
export default class RestaurantDAO {
    static async injectDB(conn) {
        if (restaurants) {
            console.log('restaurants exists')
            return
        }
        try {

            restaurants = await conn.db(process.env.RESTTREVIEWS_NS).collection('restaurants')
            console.log('connected to restaurants collection')

        }
        catch (err) {
            console.error(`unable to establish a connection habdle in restaurantsDAO: ${err}`)
        }
    }
    static async getRestaurants({
        filters = null,
        page = 0,
        restaurantsPerPage = 20
    } = {}) {
        let query
        if (filters) {
            if ("name" in filters) {
                query = { $text: { $search: filters['name'] } }
            }
            else if ('cuisine' in filters) {
                console.log('searching by cuisine')
                query = { "cuisine": { $eq: filters['cuisine'] } }
            }
            else if ('zipcode' in filters) {
                query = { "address.zipcode": { $eq: filters['zipcode'] } }
            }
        }
        let cursor
        try {
            cursor = await restaurants.find(query)

        } catch (error) {
            console.error(`unable to find command, ${err}`)
            return { restaurantsList: [], totalNumRestaurants: 0 }

        }
        const displayCursor = cursor.limit(restaurantsPerPage).skip(restaurantsPerPage * page)
        try {
            const restaurantsList = await displayCursor.toArray()
            const totalNumRestaurants = await restaurants.countDocuments(query)
            console.log(totalNumRestaurants)
            return { restaurantsList, totalNumRestaurants }
        } catch (error) {
            console.error(`unable to convert cursor into array or problem counting documents. ${error}`);
            return { restaurantsList: [], totalNumRestaurants: 0 }
        }
    }

    static async getRestaurantByID(id) {
        try {
            const pipeline = [
                {
                    $match: {
                        _id: new ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: "reviews",
                        let: {
                            id: "$_id",
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ["$restaurant_id", "$$id"],
                                    },
                                },
                            },
                            {
                                $sort: {
                                    date: -1,
                                },
                            },
                        ],
                        as: "reviews",
                    },
                },
                {
                    $addFields: {
                        reviews: "$reviews",
                    },
                },
            ]
            return await restaurants.aggregate(pipeline).next()
        } catch (e) {
            console.error(`Something went wrong in getRestaurantByID: ${e}`)
            throw e
        }
    }

    static async getCuisines() {
        let cuisines = []
        try {
            cuisines = await restaurants.distinct("cuisine")
            return cuisines
        } catch (e) {
            console.error(`Unable to get cuisines, ${e}`)
            return cuisines
        }
    }


}

import mongodb from "mongodb"
const ObjectId = mongodb.ObjectId
let reviews
export default class ReviewDAO {
    static async injectDB(conn) {
        if (reviews) {
            return
        }
        try {
            reviews = await conn.db(process.env.RESTTREVIEWS_NS).collection('reviews')
        }
        catch (error) {
            console.error(`unable to establish a collection habdles in reviewDAO:${error}`)
        }
    }
    static async addReview(restaurantId, userInfo, review, date) {
        try {
            const reviewDoc = {
                name: userInfo.name,
                user_id: userInfo._id,
                date,
                text: review,
                restaurantId: ObjectId(restaurantId)
            }
            return await reviews.insertOne(reviewDoc)

        }
        catch (error) {
            console.error(`unable to post review: ${error}`)
            throw new Error(`${error}`)

        }
    }

    static async updateReview(reviewId, userId, text, date) {
        try {
            const updatedResponse = await reviews.updateOne({

                _id: ObjectId(reviewId),

            },
                {
                    $set: { text, date }
                })
            return updatedResponse
        }
        catch (error) {
            console.error(`unable to update review: ${error}`)
            return { error }
        }
    }
    static async deleteReview(reviewId, userId) {

        try {
            const deleteResponse = await reviews.deleteOne({
                _id: ObjectId(reviewId),
                user_id: userId,
            })
            console.log(deleteResponse)
            return deleteResponse
        } catch (e) {
            console.error(`Unable to delete review: ${e}`)
            return { error: e }
        }
    }
}
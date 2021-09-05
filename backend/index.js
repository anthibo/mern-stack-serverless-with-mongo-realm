import app from './server.js'
import mongodb, { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import RestauranstDAO from './dao/restaurantDAO.js'
import ReviewsDAO from './dao/reviewDAO.js'


dotenv.config({ path: 'config.env' })
const MongoCLient = mongodb.MongoClient

const port = process.env.PORT || 8000

MongoClient.connect(
    process.env.DATABASE,
    {
        maxPoolSize: 50,
        wtimeoutMS: 250,

    }
).catch(err => {
    console.error(err)
    process.exit(1)
}).then(async client => {
    await ReviewsDAO.injectDB(client)
    await RestauranstDAO.injectDB(client)
    app.listen(port, () => {
        console.log(`listening on port ${port}`)
    })
})

import express from 'express'
import mongoose from 'mongoose'
import Posts from './postModel.js'
import Cors from 'cors'
import Pusher from 'pusher'
import dotenv from 'dotenv';


//App Config
dotenv.config()
const app = express()
const port = process.env.PORT || 9000
const connection_url = process.env.DB_CONN
const pusher = new Pusher({
    appId: "1773093",
    key: "471be9e3111804dfa17a",
    secret: "005847b64fdbfa84da95",
    cluster: "mt1",
    useTLS: true
  });

//Middleware
app.use(express.json())
app.use(Cors())
//DB Config


//API Endpoints

mongoose.connect(connection_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
    console.log('DB Connected')
    const changeStream = mongoose.connection.collection('posts').watch()
    changeStream.on('change', change => {
        console.log(change)
        if(change.operationType === "insert") {
            console.log('Trigerring Pusher')
            pusher.trigger('posts','inserted', {
                change: change
           })
        } else {
            console.log('Error trigerring Pusher')
} })
})




app.get("/", (req, res) => res.status(200).send("Hello TheWebDev"))

app.post('/upload', (req, res) => {
    const dbPost = req.body
    Posts.create(dbPost, (err, data) => {
        if(err)
            res.status(500).send(err)
        else
            res.status(201).send(data)
}) })
app.get('/sync', (req, res) => {
    Posts.find((err, data) => {
        if(err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
} })
})

//Listener
app.listen(port, () => console.log(`Listening on localhost: ${port}`))
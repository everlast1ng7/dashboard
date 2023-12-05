import express from "express";
import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import path from "path";
import cors from 'cors';
import bodyParser from 'body-parser';

const PORT = 3000;

const app = express();

// app.use(express.static(path.join(__dirname, '')))

// app.use(express.json());

app.use(cors());
app.use(bodyParser.json());

async function start() {
    try {
        const client = new MongoClient('', 
        { useNewUrlParser: true, useUnifiedTopology: true }
        );

        function getCollection() {
            const database = client.db('myDashboardDB');
            const collection = database.collection('dashboardData');
            return collection;
        }

        async function updateResult(collection, currentDocument) {
            const updateResult = await collection.updateOne({ "_id": currentDocument._id}, { $set: { graphName2: currentDocument.graphName2 } });
            if (updateResult.modifiedCount === 1) {
                console.log('Новые данные успешно обновлены в базе данных');
            } else {
                console.log('Произошла ошибка при обновлении новых данных в базе данных');
            }
        }

        app.get('/graphs', async (req, res) => {
            const collection = getCollection();
            const document = await collection.findOne();
            res.json({maxValue: document.maxValue, graphName2: document.graphName2});
        });

        app.post('/add', async (req, res) => {
            const receivedData = req.body; 
            const collection = getCollection();
            const currentDocument = await collection.findOne();
            const newData = { value: receivedData.value, name: receivedData.name };
            currentDocument.graphName2.items.push(newData); 
            updateResult(collection, currentDocument);
        });

        app.post('/remove', async (req, res) => {
            const receivedData = req.body; 
            const collection = getCollection();
            const currentDocument = await collection.findOne();
            const newIndex = receivedData.index;
            currentDocument.graphName2.items.splice(receivedData.index, 1);
            updateResult(collection, currentDocument);
        });

        app.post('/update', async (req, res) => {
            const receivedData = req.body;
            console.log(req.body); 
            const collection = getCollection();
            const currentDocument = await collection.findOne();
            const newIndex = receivedData.index;
            const newValue = receivedData.value;
            currentDocument.graphName2.items[newIndex] = {name: currentDocument.graphName2.items[newIndex].name, value: newValue};
            updateResult(collection, currentDocument);
        });
          
        app.listen(PORT, () => {
            console.log('Ready');
        })
    } catch (e) {
        console.log(e);
    }
}

start();







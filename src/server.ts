import http from 'http'; 
import express from 'express';
import path from 'path';
import { createConnection } from 'typeorm';
import { applyRoutes } from './utils/applyRoutes'

import apiRoutes from './routes'

import { Task, Log, Project } from './entities';

createConnection({
  "type": "postgres",
  "username": "pantalaimon",
  "password": "banana",
  "port": 5432,
  "database": "pantalaimon",
  "entities": [
    Task, Log, Project
  ]
}).then( async connection => {

  await connection.synchronize();

  const router = express();

  router.use( express.json() )

  router.use(express.static(path.join(__dirname, "../client/build")));

  applyRoutes(apiRoutes, router)

  router.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
  })

  const server = http.createServer(router);

  server.listen(3030, () => {
    console.log("server is up localhost 3030.");
  })
})

import { defineBlock } from "myd";
import express from "express";

export default defineBlock({
  path: "/", // base path
  middlewares: [express.urlencoded()], // similar to express.use()
  routes: {

    "/": async (req, res) => {
      res.json({ message: "❤️ Welcome to MyD.JS" });
    },

    "/article/:id": {
      GET:  (req, res) => {
        res.json({ message: "Article ID" });
      },
      POST: [
        express.json(), // middleware for one route and one method

        (req, res) => {
          res.json(req.body /**return JSON */);
        },
      ],
      "/detail": {
        POST: (req, res) => {
          res.json({ message: req.params.id /** $ID from "/user/:id" */ });
        },
      },
    },
  },
});

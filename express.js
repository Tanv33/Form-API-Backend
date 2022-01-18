import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import connectWithDataBase from "./database.js";
import { upload } from "./multer.js";
import { Dropbox } from "dropbox";
import Form from "./models/form.js";
import { readFile, unlink } from "fs/promises";

const app = express();
const port = 3000;

connectWithDataBase();
dotenv.config();
app.use(express.json());
app.use(morgan("dev"));

// Now frontend dev can use my Server
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Route 1
app.get("/", (req, res) => res.send("Hello World!"));

// Route 2  -- upload.array is for images/files of all Type. maxImg = 4
app.post("/api/v1/submitform", upload.array("myfile", 2), async (req, res) => {
  try {
    // Destructuring
    const { firstName, lastName, email, password, phoNumber, address } =
      req.body;

    // Dropbox sending file to cloud
    const dbx = new Dropbox({
      accessToken: process.env.token,
      // fetch,
    });
    let downloadUrls = [];
    if (req.files.length === 0) {
      return res.status(401).send("File missing");
    }
    if (req.files.length > 2) {
      req.files.map(async (file) => {
        await unlink(file.path);
      });
      return res.status(401).send("2 files allowed");
    }
    if (req.files.length < 2) {
      req.files.map(async (file) => {
        await unlink(file.path);
      });
      return res.status(401).send("2 files required");
    }
    req.files.map(async (file) => {
      const response = await axios({
        method: `POST`,
        url: `https://content.dropboxapi.com/2/files/upload`,
        headers: {
          Authorization: `Bearer ${process.env.token}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": `{"path":"/${file.filename}"}`, //file path of dropbox
        },
        data: await readFile(file.path), //local path to uploading file
      });
      if (response) {
        console.log(response);
        const createdLink = await dbx.sharingCreateSharedLinkWithSettings({
          path: response.data.path_display,
          settings: {
            requested_visibility: "public",
            audience: "public",
            access: "viewer",
          },
        });
        if (createdLink) {
          downloadUrls.push(createdLink.result.url);
          console.log(createdLink.result.url);
          if (req.files.length === downloadUrls.length) {
            req.files.map(async (file) => {
              await unlink(file.path);
            });
            const savingUrl = await new Form({
              firstName,
              lastName,
              email,
              password,
              phoNumber,
              address,
              image1: downloadUrls[0],
              image2: downloadUrls[1],
            });
            const saved = await savingUrl.save();
            if (saved) {
              console.log(saved);
              res.send("form saved successfully");
            }
          }
        } else {
          res.status(500).send("Error in creating Download Link");
        }
      } else {
        res.status(400).send("Error in dropBox");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Some Error Occured");
  }
});

app.listen(port, () =>
  console.log(`Example app listening on port http://localhost:${port}`)
);

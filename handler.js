"use strict";

const aws = require("aws-sdk");
const s3 = new aws.S3();

const sharp = require("sharp");

const get = require("lodash.get");

const dotenv = require("dotenv");
dotenv.config();

aws.config.region = process.env.REGION;

const BUCKET = process.env.BUCKET;
const FROMDATE = "2020-03-01";
const WIDTH = process.env.IMAGE_WIDTH;
const BACKUP_DIR = process.env.BACKUP_DIR;

async function getImageObject({ BUCKET = "", Key = "" }) {
  console.log("[*] getImageObject ", BUCKET, Key);
  return s3.getObject({ BUCKET, Key }).promise();
}

async function resizeImage(imageObject) {
  console.log("[*] resizeImage ", imageObject);
  return sharp(imageObject.Body).resize({ width: WIDTH }).toBuffer();
}

async function moveOriginFileTo(originalImage, filename) {
  await putObject(
    originalImage.ContentType,
    `${BACKUP_DIR}/${filename}`,
    originalImage.Body
  );
}

async function putObject(contentType, filename, buffer) {
  console.log("[*] putObject ", contentType, filename, buffer);
  await s3
    .putObject({
      BUCKET,
      Key: filename,
      ContentType: contentType,
      ACL: "public-read",
      Body: buffer,
    })
    .promise();
}

module.exports.resizeImage = async (event, context, callback) => {
  try {
    const list = await s3.listObjects({ BUCKET, Prefix: "theme" }).promise();
    const keys = get(list, "Contents", [])
      .filter((c) => {
        return new Date(c.LastModified) > new Date(FROMDATE);
      })
      .map((c) => c.Key);

    console.log("[*] filenames ", keys);

    for (const filename of keys) {  // >> This is not a smart way <<
      const param = { BUCKET, Key: filename };
      const originalImage = await getImageObject(param);
      await moveOriginFileTo(originalImage, filename);
      const resizedBuffer = await resizeImage(originalImage);
      await putObject(originalImage.ContentType, filename, resizedBuffer);
    }

  } catch (err) {
    callback(`Error resizing files: ${err}`);
  }
};

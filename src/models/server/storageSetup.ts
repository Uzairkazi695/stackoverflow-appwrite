import { questionAttachmentCollection } from "../name";
import { storage } from "./config";
import { Permission } from "node-appwrite";

export default async function getOrCreateStorageCollection() {
  try {
    await storage.getBucket(questionAttachmentCollection);
    console.log("Storage collection already exists");
  } catch (error) {
    try {
      await storage.createBucket(
        questionAttachmentCollection,
        questionAttachmentCollection,
        [
          Permission.read("any"),
          Permission.create("users"),
          Permission.read("users"),
          Permission.update("users"),
          Permission.delete("users"),
        ],
        false,
        undefined,
        undefined,
        ["jpg", "png", "gif", "jpeg", "webp", "heic"]
      );
      console.log("Storage collection created");
    } catch (error) {
      console.log("Error creating storage collection", error);
    }
  }
}

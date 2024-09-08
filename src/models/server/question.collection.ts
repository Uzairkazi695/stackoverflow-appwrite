import { db, questionCollection } from "../name";
import { databases } from "./config";
import { IndexType, Permission } from "node-appwrite";

export default async function createQuestionCollection() {
  await databases.createCollection(db, questionCollection, questionCollection, [
    Permission.read("any"),
    Permission.create("users"),
    Permission.update("users"),
    Permission.delete("users"),
  ]);
  console.log("Question collection created");

  // create attributes

  await Promise.all([
    databases.createStringAttribute(db, questionCollection, "title", 100, true),
    databases.createStringAttribute(
      db,
      questionCollection,
      "content",
      10000,
      true
    ),
    databases.createStringAttribute(
      db,
      questionCollection,
      "authorId",
      50,
      true
    ),
    databases.createStringAttribute(
      db,
      questionCollection,
      "tags",
      50,
      true,
      undefined,
      true
    ),
    databases.createStringAttribute(
      db,
      questionCollection,
      "attachmentId",
      50,
      false
    ),
  ]);
  console.log("Question attribute created");

  // create indexes

  await Promise.all([
    databases.createIndex(
      db,
      questionCollection,
      "title",
      IndexType.Fulltext,
      ["title"],
      ["ASC"]
    ),
    databases.createIndex(
      db,
      questionCollection,
      "content",
      IndexType.Fulltext,
      ["content"],
      ["ASC"]
    ),
  ]);
}

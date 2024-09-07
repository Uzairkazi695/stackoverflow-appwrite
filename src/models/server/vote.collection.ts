import { db, voteCollection } from "../name";
import { databases } from "./config";
import { IndexType, Permission } from "node-appwrite";

export default async function createVoteCollection() {
  await databases.createCollection(db, voteCollection, voteCollection, [
    Permission.read("any"),
    Permission.create("users"),
    Permission.read("users"),
    Permission.update("users"),
    Permission.delete("users"),
  ]);
  console.log("Vote collection created");

  // create attributes

  await Promise.all([
    databases.createStringAttribute(db, voteCollection, "typeId", 50, true),
    databases.createStringAttribute(db, voteCollection, "voteById", 50, true),
    databases.createEnumAttribute(
      db,
      voteCollection,
      "voteStatus",
      ["upvote", "downvote"],
      true
    ),
    databases.createEnumAttribute(
      db,
      voteCollection,
      "type",
      ["question", "answer"],
      true
    ),
  ]);
  console.log("Vote attribute created");
}

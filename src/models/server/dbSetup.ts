import { db } from "../name";
import createAnswerCollection from "./answer.collection";
import createCommentCollection from "./comment.collection";
import { databases } from "./config";
import createQuestionCollection from "./question.collection";
import createVoteCollection from "./vote.collection";

export default async function getOrCreateDb() {
  try {
    await databases.get(db);
    console.log("databases connected");
  } catch (error) {
    try {
      await databases.create(db, db);
      console.log("databases created");
      await Promise.all([
        createQuestionCollection(),
        createAnswerCollection(),
        createCommentCollection(),
        createVoteCollection(),
      ]);
      console.log("Collections created Successfully");
      console.log("Databases connected successfully");
    } catch (error) {
      console.log("Error creating databases or collections", error);
    }
  }
  return databases;
}

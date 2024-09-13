import QuestionCard from "@/components/QuestionCard";
import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { Query } from "node-appwrite";
import React from "react";

export default async function LatestQuestion() {
  const questions = await databases.listDocuments(db, questionCollection, [
    Query.orderDesc("$createdAt"),
    Query.limit(5),
  ]);

  questions.documents = await Promise.all(
    questions.documents.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(25),
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(25),
        ]),
      ]);
      const authorPrefs = await users.getPrefs(author.$id);
      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          reputation: authorPrefs.reputation,
          name: author.name,
        },
      };
    })
  );

  return (
    <div className="mb-20">
      {questions.documents.map((question) => (
        <QuestionCard key={question.$id} ques={question} />
      ))}
    </div>
  );
}

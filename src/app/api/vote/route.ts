import {
  answerCollection,
  db,
  questionCollection,
  voteCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { typeId, type, voteById, voteStatus } = await request.json();

    const response = await databases.listDocuments(db, voteCollection, [
      Query.equal("type", type),
      Query.equal("typeId", typeId),
      Query.equal("voteById", voteById),
    ]);

    if (response.documents.length > 0) {
      await databases.deleteDocument(
        db,
        voteCollection,
        response.documents[0].$id
      );

      const QuestionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      const auhorPrefs = await users.getPrefs<UserPrefs>(
        QuestionOrAnswer.authorId
      );

      await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
        reputation:
          response.documents[0].voteStatus === "upvote"
            ? Number(auhorPrefs.reputation) - 1
            : Number(auhorPrefs.reputation) + 1,
      });
    }

    if (response.documents[0]?.voteStatus !== voteStatus) {
      const doc = await databases.createDocument(
        db,
        voteCollection,
        ID.unique(),
        {
          type: type,
          typeId: typeId,
          voteById: voteById,
          voteStatus: voteStatus,
        }
      );
      // Increase or decrease author reputation
      const QuestionOrAnswer = await databases.getDocument(
        db,
        type === "question" ? questionCollection : answerCollection,
        typeId
      );

      const auhorPrefs = await users.getPrefs<UserPrefs>(
        QuestionOrAnswer.authorId
      );

      // if vote is present

      if (response.documents[0]) {
        await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
          reputation:
            doc.voteStatus === "upvote"
              ? Number(auhorPrefs.reputation) - 1
              : Number(auhorPrefs.reputation) + 1,
        });
      } else {
        await users.updatePrefs<UserPrefs>(QuestionOrAnswer.authorId, {
          reputation:
            doc.voteStatus === "upvote"
              ? Number(auhorPrefs.reputation) + 1
              : Number(auhorPrefs.reputation) - 1,
        });
      }
    }

    const [upvote, downvote] = await Promise.all([
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteById", voteById),
        Query.equal("voteStatus", "upvote"),
        Query.limit(1),
      ]),
      databases.listDocuments(db, voteCollection, [
        Query.equal("type", type),
        Query.equal("typeId", typeId),
        Query.equal("voteById", voteById),
        Query.equal("voteStatus", "downvote"),
        Query.limit(1),
      ]),
    ]);

    return NextResponse.json(
      {
        data: {
          document: null,
          voteResult: (upvote.total = downvote.total),
        },
        message: "Vote created successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error creating vote" },
      { status: error?.status || error?.code || 500 }
    );
  }
}

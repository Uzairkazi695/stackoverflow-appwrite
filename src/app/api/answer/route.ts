import { answerCollection, db } from "@/models/name";
import { databases, users } from "@/models/server/config";
import { UserPrefs } from "@/store/Auth";
import { NextRequest, NextResponse } from "next/server";
import { ID, Query } from "node-appwrite";

export async function POST(request: NextRequest) {
  try {
    const { questionId, answer, authorId } = await request.json();

    // create answer
    const response = await databases.createDocument(
      db,
      answerCollection,
      ID.unique(),
      {
        content: answer,
        questionId: questionId,
        authorId: authorId,
      }
    );
  

    // Increase author reputation

    const prefs = await users.getPrefs<UserPrefs>(authorId);

    await users.updatePrefs<UserPrefs>(authorId, {
      reputation: Number(prefs.reputation) + 1,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { answerId } = await request.json();

    const answer = await databases.getDocument(db, answerCollection, answerId);

    if (!answer) {
      return NextResponse.json(
        {
          error: "Answer not found",
        },
        { status: 404 }
      );
    }

    const response = await databases.deleteDocument(
      db,
      answerCollection,
      answerId
    );

    // Decrease author reputation

    const prefs = await users.getPrefs<UserPrefs>(answer.authorId);

    await users.updatePrefs<UserPrefs>(answer.authorId, {
      reputation: Number(prefs.reputation) - 1,
    });

    return NextResponse.json({ data: response }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error deleting answer",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}

export async function GET(request: NextRequest) {


  try {
    const { questionId } = await request.json();
  
    
    const response = await databases.listDocuments(db, answerCollection, [
      Query.equal("questionId", questionId),
    ]);
    

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Error creating answer",
      },
      { status: error?.status || error?.code || 500 }
    );
  }
}

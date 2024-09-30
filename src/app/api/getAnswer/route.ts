import { answerCollection, db } from "@/models/name";
import { databases } from "@/models/server/config";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function POST(request: NextRequest) {
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

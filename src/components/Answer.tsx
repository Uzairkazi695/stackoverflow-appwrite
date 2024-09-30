"use client";

import { useAuthStore } from "@/store/Auth";
import { Models } from "node-appwrite";
import RTE, { MarkdownEditor } from "./RTE";
import Link from "next/link";
import { IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import axios from "axios";
import VoteButtons from "./VoteButtons";

export default function Answers({
  answers: _answers,
  questionId,
}: {
  answers: Models.DocumentList<Models.Document>;
  questionId: string;
}) {
  const [answers, setAnswers] = useState(_answers);
  const [newAnswer, setNewAnswer] = useState("");

  const { user } = useAuthStore();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newAnswer || !user) return;
    try {
      const response = await axios.post("/api/answer", {
        questionId: questionId,
        answer: newAnswer,
        authorId: user.$id,
      });

      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setAnswers((prev) => ({
        total: prev.total + 1,
        comments: { document: [newAnswer], total: 1 },
        documents: [
          {
            ...response.data,
            author: user,
            upvotesDocuments: { documents: [], total: 0 },
            downvotesDocuments: { documents: [], total: 0 },
            comments: { documents: [], total: 0 },
          },
          ...prev.documents,
        ],
      }));
    } catch (error: any) {
      console.log(error);
      window.alert(error?.message || "Something went wrong");
    }
  };

  const deleteAnswer = async (answerId: string) => {
    try {
      const response = await axios.delete(`/api/answer`, {
        data: {
          answerId,
        },
      });
      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setAnswers((prev) => ({
        total: prev.total - 1,
        documents: prev.documents.filter((a) => a.$id !== answerId),
      }));
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  const getAnswers = async () => {
    try {
      const response = await axios.post(`/api/getAnswer`, {
        questionId: questionId,
      });

      setAnswers(response.data);
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getAnswers();
  }, []);
  return (
    <>
      <h2 className="mb-4 text-xl">
        {answers.total ? answers.total : "0"} Answers
      </h2>
      {answers.documents.map((answer) => (
        <div key={answer.$id} className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center gap-4">
            <VoteButtons
              type="answer"
              id={answer.$id}
              upvote={answer.upvotesDocuments}
              downvote={answer.downvotesDocuments}
            />
            {user?.$id === answer.authorId ? (
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-red-500 p-1 text-red-500 duration-200 hover:bg-red-500/10"
                onClick={() => deleteAnswer(answer.$id)}
              >
                <IconTrash className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="w-full overflow-auto">
            <MarkdownEditor
              className="rounded-xl p-4"
              source={answer.content}
            />
            <div className="mt-4 flex items-center justify-end gap-1">
              <picture>
                {/* <img
                  src={avatars.getInitials(answer.author.name, 36, 36).href}
                  alt={answer.author.name}
                  className="rounded-lg"
                /> */}
              </picture>
              <div className="block leading-tight">
                <Link
                  href={`/users/${answer.authorId}`}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {/* {answer.author.name} */}
                </Link>
                <p>{/* <strong>{answer.author.reputation}</strong> */}</p>
              </div>
            </div>
            {/* <Comments
              comments={answer.comments}
              className="mt-4"
              type="answer"
              typeId={answer.$id}
            /> */}
            <hr className="my-4 border-white/40" />
          </div>
        </div>
      ))}
      <hr className="my-4 border-white/40" />
      <form onSubmit={handleSubmit} className="space-y-2">
        <h2 className="mb-4 text-xl">Your Answer</h2>
        <RTE
          value={newAnswer}
          onChange={(value) => setNewAnswer(() => value || "")}
        />
        <button className="shrink-0 rounded bg-orange-500 px-4 py-2 font-bold text-white hover:bg-orange-600">
          Post Your Answer
        </button>
      </form>
    </>
  );
}

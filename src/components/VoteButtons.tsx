"use client";
import { cn } from "@/lib/utils";
import { db, voteCollection } from "@/models/name";
import { databases } from "@/models/client/config";
import { useAuthStore } from "@/store/Auth";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";
import { ID, Models, Query } from "appwrite";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function VoteButtons({
  type,
  id,
  upvote,
  downvote,
  className,
}: {
  type: "question" | "answer";
  id: string;
  upvote: Models.DocumentList<Models.Document>;
  downvote: Models.DocumentList<Models.Document>;
  className?: string;
}) {
  const [voteDocument, setVoteDocument] = useState<Models.Document | null>();
  const [voteResult, setVoteResult] = useState<number>(
    Number(upvote ? upvote.total : 0) - Number(downvote ? downvote.total : 0)
  );

  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (user) {
        const response = await databases.listDocuments(db, voteCollection, [
          Query.equal("type", type),
          Query.equal("typeId", id),
          Query.equal("voteById", user.$id),
        ]);
        setVoteDocument(() => response.documents[0] || null);
      }
    })();
  }, [user, type, id]);

  const toggleUpvote = async () => {
    if (!user) return router.push("/login");
    if (voteDocument === undefined) return;
    try {
      const response = await axios.post("/api/vote", {
        typeId: id,
        type,
        voteById: user.$id,
        voteStatus: "upvote",
      });
      console.log(response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setVoteResult(() => response.data.data.voteResult);
      setVoteDocument(() => response.data.data.document);
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  const toggleDownvote = async () => {
    if (!user) return router.push("/login");
    if (voteDocument === undefined) return;
    try {
      const response = await axios.post("/api/vote", {
        typeId: id,
        type,
        voteById: user.$id,
        voteStatus: "downvote",
      });
      console.log("From here",response.data);

      if (response.data.error) {
        throw new Error(response.data.error);
      }
      setVoteResult(() => response.data.data.voteResult);
      setVoteDocument(() => response.data.data.document);
    } catch (error: any) {
      window.alert(error?.message || "Something went wrong");
    }
  };

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-start gap-y-4",
        className
      )}
    >
      <button
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
          voteDocument && voteDocument.voteStatus === "upvote"
            ? "border-orange-500 text-orange-500"
            : "border-white/30"
        )}
        onClick={toggleUpvote}
      >
        <IconCaretUpFilled />
      </button>
      <span>{voteResult}</span>
      <button
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full border p-1 duration-200 hover:bg-white/10",
          voteDocument && voteDocument.voteStatus === "downvote"
            ? "border-orange-500 text-orange-500"
            : "border-white/30"
        )}
        onClick={toggleDownvote}
      >
        <IconCaretDownFilled />
      </button>
    </div>
  );
}

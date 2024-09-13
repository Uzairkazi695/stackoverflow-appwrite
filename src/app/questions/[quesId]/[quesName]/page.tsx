import Answers from "@/components/Answer";
import Comments from "@/components/Comments";
import { MarkdownEditor } from "@/components/RTE";
import VoteButtons from "@/components/VoteButtons";
import Particles from "@/components/magicui/particles";
import ShimmerButton from "@/components/magicui/shimmer-button";
import { avatars } from "@/models/client/config";
import {
  answerCollection,
  db,
  voteCollection,
  questionCollection,
  commentCollection,
  questionAttachmentCollection,
} from "@/models/name";
import { databases, users } from "@/models/server/config";
import { storage } from "@/models/client/config";
import { UserPrefs } from "@/store/Auth";
import convertDateToRelativeTime from "@/utils/relativeTime";
import slugify from "@/utils/slugify";
import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { Query } from "node-appwrite";
import React from "react";
import DeleteQuestion from "./DeleteQuestion";
import EditQuestion from "./EditQuestion";
import { TracingBeam } from "@/components/ui/tracing-beam";

const Page = async ({
  params,
}: {
  params: { quesId: string; quesName: string };
}) => {
  const [question, answers, upvote, downvote, comments] = await Promise.all([
    databases.getDocument(db, questionCollection, params.quesId),
    databases.listDocuments(db, answerCollection, [
      Query.orderDesc("$createdAt"),
      Query.equal("questionId", params.quesId),
    ]),
    databases.listDocuments(db, voteCollection, [
      Query.equal("typeId", params.quesId),
      Query.equal("type", "question"),
      Query.equal("voteStatus", "upvote"),
      Query.limit(1), // for optimization
    ]),
    databases.listDocuments(db, voteCollection, [
      Query.equal("typeId", params.quesId),
      Query.equal("type", "question"),
      Query.equal("voteStatus", "downvote"),
      Query.limit(1), // for optimization
    ]),
    databases.listDocuments(db, commentCollection, [
      Query.equal("type", "question"),
      Query.equal("typeId", params.quesId),
      Query.orderDesc("$createdAt"),
    ]),
  ]);

  const author = await users.get<UserPrefs>(question.authorId);
  [comments.documents, answers.documents] = await Promise.all([
    Promise.all(
      comments.documents.map(async (comment) => {
        const author = await users.get<UserPrefs>(comment.authorId);
        return {
          ...comment,
          author: {
            $id: author.$id,
            reputation: author.prefs.reputation,
            name: author.name,
          },
        };
      })
    ),
    Promise.all(
      answers.documents.map(async (answer) => {
        const [author, comments, upvote, downvote] = await Promise.all([
          users.get<UserPrefs>(answer.authorId),
          databases.listDocuments(db, commentCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.orderDesc("$createdAt"),
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.equal("voteStatus", "upvote"),
            Query.limit(1), // for optimization
          ]),
          databases.listDocuments(db, voteCollection, [
            Query.equal("typeId", answer.$id),
            Query.equal("type", "answer"),
            Query.equal("voteStatus", "downvote"),
            Query.limit(1), // for optimization
          ]),
        ]);
        comments.documents = await Promise.all(
          comments.documents.map(async (comment) => {
            const author = await users.get<UserPrefs>(comment.authorId);
            return {
              ...comment,
              author: {
                $id: author.$id,
                reputation: author.prefs.reputation,
                name: author.name,
              },
            };
          })
        );
        return {
          ...answer,
          comments,
          upvotesDocuments: upvote,
          downvotesDocuments: downvote,
          author: {
            $id: author.$id,
            reputation: author.prefs.reputation,
            name: author.name,
          },
        };
      })
    ),
  ]);
  const queries = [Query.orderDesc("$createdAt"), Query.limit(25)];

  const questions = await databases.listDocuments(
    db,
    commentCollection,
    queries
  );

  questions.documents = await Promise.all(
    questions.documents.map(async (ques) => {
      const [author, answers, votes] = await Promise.all([
        users.get<UserPrefs>(ques.authorId),
        databases.listDocuments(db, answerCollection, [
          Query.equal("questionId", ques.$id),
          Query.limit(1), // for optimization
        ]),
        databases.listDocuments(db, voteCollection, [
          Query.equal("type", "question"),
          Query.equal("typeId", ques.$id),
          Query.limit(1), // for optimization
        ]),
      ]);
      console.log("From here", answers);
      
      return {
        ...ques,
        totalAnswers: answers.total,
        totalVotes: votes.total,
        author: {
          $id: author.$id,
          reputation: author.prefs.reputation,
          name: author.name,
        },
      };
    })
  );
  return (
    <TracingBeam className="container pl-6">
      <Particles
        className="fixed inset-0 h-full w-full"
        quantity={500}
        ease={100}
        color="#ffffff"
        refresh
      />
      <div className="relative mx-auto px-4 pb-20 pt-36">
        <div className="flex">
          <div className="w-full">
            <h1 className="mb-1 text-3xl font-bold">{question.title}</h1>
            <div className="flex gap-4 text-sm">
              <span>
                Asked {convertDateToRelativeTime(new Date(question.$createdAt))}
              </span>
              <span>Answer {answers.total.toString()}</span>
              <span>Votes {upvote.total + downvote.total}</span>
            </div>
          </div>
          <Link href="/questions/ask" className="ml-auto inline-block shrink-0">
            <ShimmerButton className="shadow-2xl">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Ask a question
              </span>
            </ShimmerButton>
          </Link>
        </div>
        <hr className="my-4 border-white/40" />
        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col items-center gap-4">
            <VoteButtons
              type="question"
              id={question.$id}
              className="w-full"
              upvote={upvote}
              downvote={downvote}
            />
            <EditQuestion
              questionId={question.$id}
              questionTitle={question.title}
              authorId={question.authorId}
            />
            <DeleteQuestion
              questionId={question.$id}
              authorId={question.authorId}
            />
          </div>
          <div className="w-full overflow-auto">
            <MarkdownEditor
              className="rounded-xl p-4"
              source={question.content}
            />
            <picture>
              <img
                src={
                  storage.getFilePreview(
                    questionAttachmentCollection,
                    question.attachmentId
                  ).href
                }
                alt={question.title}
                className="mt-3 rounded-lg"
              />
            </picture>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              {question.tags.map((tag: string) => (
                <Link
                  key={tag}
                  href={`/questions?tag=${tag}`}
                  className="inline-block rounded-lg bg-white/10 px-2 py-0.5 duration-200 hover:bg-white/20"
                >
                  #{tag}
                </Link>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-end gap-1">
              <picture>
                <img
                  src={avatars.getInitials(author.name, 36, 36).href}
                  alt={author.name}
                  className="rounded-lg"
                />
              </picture>
              <div className="block leading-tight">
                <Link
                  href={`/users/${author.$id}/${slugify(author.name)}`}
                  className="text-orange-500 hover:text-orange-600"
                >
                  {author.name}
                </Link>
                <p>
                  <strong>{author.prefs.reputation}</strong>
                </p>
              </div>
            </div>
            <Comments
              comments={comments}
              className="mt-4"
              type="question"
              typeId={question.$id}
            />
            <hr className="my-4 border-white/40" />
          </div>
        </div>
        <Answers answers={answers} questionId={question.$id} />
      </div>
    </TracingBeam>
  );
};

export default Page;

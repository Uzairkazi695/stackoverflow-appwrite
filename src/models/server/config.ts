import env from "@/app/env";
import { Avatars, Client, Databases, Storage, Users } from "node-appwrite";

const client = new Client();

client
  .setEndpoint(env.appwrite.endpoint) // Your API Endpoint
  .setProject(env.appwrite.projectId) // Your project ID
  .setKey(env.appwrite.apikey); // Your secret API key

export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
export const users = new Users(client);

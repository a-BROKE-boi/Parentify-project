import { articlesData } from "../lib/testdata/articles";
import { flashcardsData } from "../lib/testdata/flashcards";
import { forumsData } from "../lib/testdata/forums";
import { usersData } from "../lib/testdata/users";

import { runSeed } from "../lib/seed/run-seed";
import connect from "../lib/index";
import * as mongoDB from "mongodb";
import { NextRequest, NextResponse } from "next/server";

import {GET as getAllForums} from "../app/api/forums/route";
import { GET as getAllUsers } from "../app/api/users/route";
import { GET as getUserById } from "../app/api/users/[id]/route";
import {GET as getFlashcards} from '../app/api/flashcards/[id]/route'
import exp from "constants";

import { GET as getCatchAll } from "../app/api/[...slug]/route";

import { GET as getAllArticles } from "../app/api/articles/route";


let client: mongoDB.MongoClient;
let db: mongoDB.Db;

beforeAll(async () => {
    client = await connect();
    db = client.db("test");
});

beforeEach(async () => {
    await runSeed(usersData, flashcardsData, forumsData, articlesData);
});

afterAll(async () => {
    await client.close();
});

describe("seed()", () => {
    test("seed should insert data into the users collection", async () => {
        const users = db.collection("users");
        const count = await users.countDocuments();

        expect(count).toBe(5);
    });
    test("seed should insert data into the articles collection", async () => {
        const articles = db.collection("articles");
        const count = await articles.countDocuments();

        expect(count).toBe(5);
    });
    test("seed should insert data into the forums collection", async () => {
        const forums = db.collection("forums");
        const count = await forums.countDocuments();

        expect(count).toBe(5);
    });
    test("seed should insert data into the flashcards collection", async () => {
        const flashcards = db.collection("flashcards");
        const count = await flashcards.countDocuments();

        expect(count).toBe(5);
    });
});

describe("/api/any-undefined-route", () => {
    test("Non existent endpoints should return 404", async () => {
        const req = {} as NextRequest;
        const res = (await getCatchAll(req)) as NextResponse;

        const data = await res.json();

        expect(res.status).toBe(404);
        expect(data.error).toBe("404 Error: Resource doesn't exist");
    });
});

describe("/api/users", () => {
    test("Should return an array", async () => {
        const req = {} as NextRequest;
        const res = (await getAllUsers(req)) as NextResponse;

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(Array.isArray(data.users)).toBe(true);

        data.users.forEach((user: any) => {
            expect(user).toHaveProperty("_id");
            expect(user).toHaveProperty("full_name");
            expect(user).toHaveProperty("email");
            expect(user).toHaveProperty("password");
            expect(user).toHaveProperty("bookmarks");
            expect(user).toHaveProperty("progress");
        });
    });
});

describe("/api/users/:_id", () => {
    test("Should return data associated with specified id", async () => {
        const req = {} as NextRequest;
        const params = { params: { id: "664db5ae509cc0afb30cc382" } };
        const res = (await getUserById(req, params)) as NextResponse;

        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.user.full_name).toBe("Alex Johnson");
    });
    test("Should return a 404 error for non-existent id", async () => {
        const req = {} as NextRequest;
        const params = { params: { id: "664d9e9f509cc0afb30cc369" } };
        const res = (await getUserById(req, params)) as NextResponse;

        const user = await res.json();

        expect(res.status).toBe(404);
        expect(user.error).toBe("404 Error: Resource doesn't exist");
    });
    test("Should return a 400 error for an invalid id Type", async () => {
        const req = {} as NextRequest;
        const params = { params: { id: "non-valid-id-string" } };
        const res = (await getUserById(req, params)) as NextResponse;

        const user = await res.json();

        expect(res.status).toBe(400);
        expect(user.error).toBe("400 Error: Invalid ID Syntax");
    });
});

describe("/api/articles", () => {
  test("should return array of all articles", async () => {
    const req = {} as NextRequest;
    const res = (await getAllArticles(req)) as NextResponse;

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data.articles)).toBe(true);

    data.articles.forEach((article: any) => {
      expect(article).toHaveProperty("_id");
      expect(article).toHaveProperty("title");
      expect(article).toHaveProperty("link");
      expect(article).toHaveProperty("img_url");
      expect(article).toHaveProperty("body");
      expect(article).toHaveProperty("source");
    });
  });
});

describe("GET /api/forums", () => {
  test("should return array of forum posts as objects", async () => {
    const req = {} as NextRequest;
    const res = await getAllForums(req) as NextResponse;
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(data.forums)).toBe(true);
   data.forums.forEach((forum: any) => {
    expect(forum).toHaveProperty('title')
    expect(forum).toHaveProperty('body')
    expect(forum).toHaveProperty('comments')
    expect(forum).toHaveProperty('votes')
    expect(forum).toHaveProperty('date')
    expect(forum).toHaveProperty('author')
    })
  })
  });
 
describe('GET /api/flashcards/id', () => {
    test('returns only flashcards with correct unit number', async () => {
      const req = {} as NextRequest
      const params = {params: {id: '4'}}
      const res = await getFlashcards(req, params) as NextResponse;
      const flashcards = await res.json()
      expect(res.status).toBe(200);
      flashcards.flashcards.forEach((flashcard: any) =>{
        expect(flashcard.unit).toBe(4)
    })})
    test('returns 400 error for incorrect unit id', async () => {
      const req = {} as NextRequest
      const params = {params: {id: '5bool'}}
      const res = await getFlashcards(req, params) as NextResponse;
      const errorData = await res.json()
      expect(res.status).toBe(400);
      expect(res.ok).toBe(false);
      expect(errorData.msg).toBe('Bad Request')
    })
    test('Returns 404 error for non-existant unit id', async () => {
      const req = {} as NextRequest
      const params = {params: {id: '200'}}
      const res = await getFlashcards(req, params) as NextResponse;
      const errorData = await res.json()
      expect(res.status).toBe(404);
      expect(res.ok).toBe(false);
      expect(errorData.msg).toBe('Not Found')
    })
  })
      

import { Elysia, t } from "elysia";

const cards: {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}[] = [];

const app = new Elysia()
  .get("/", () => "Hello Elysia")
  .group("/cards", (app) =>
    app
      .get("/", () => cards)
      .post(
        "/",
        ({ body }) => {
          cards.push(body);
          return cards;
        },
        {
          body: t.Object({
            question: t.String(),
            answer: t.String(),
            difficulty: t.UnionEnum(["easy", "medium", "hard"]),
          }),
        },
      )
      .post(
        "/:id/submit",
        ({ params: { id }, body: { userAnswer } }) => ({
          correct: cards[id].answer.toLowerCase() === userAnswer.toLowerCase(),
        }),
        {
          params: t.Object({
            id: t.Number(),
          }),
          body: t.Object({
            userAnswer: t.String(),
          }),
        },
      )
      .delete("/:id", ({ params: { id } }) => id, {
        params: t.Object({
          id: t.Number(),
        }),
      }),
  )
  .listen(3000);

app
  .handle(
    new Request("http://localhost/cards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "What is your name?",
        answer: "John Doe",
        difficulty: "easy",
      }),
    }),
  )
  .then(async (res) => {
    // Use res.json() or res.text() to see the actual response data
    const data = await res.json();
    console.log(data);
  });

app
  .handle(
    new Request("http://localhost/cards/0/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswer: "John Doe",
      }),
    }),
  )
  .then(async (res) => console.log(await res.json()));

app
  .handle(
    new Request("http://localhost/cards/0/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswer: "john doe",
      }),
    }),
  )
  .then(async (res) => console.log(await res.json()));

app
  .handle(
    new Request("http://localhost/cards/0/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userAnswer: "Yuh yuh",
      }),
    }),
  )
  .then(async (res) => console.log(await res.json()));

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

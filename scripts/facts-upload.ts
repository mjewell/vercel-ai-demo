import "@/lib/env/load";
import { env } from "@/lib/env";

async function upload() {
  const facts = [
    "Dogs have about 300 million scent receptors in their noses, compared to about 5 million in humans.",
    "Honey never spoils—you could eat 3,000-year-old honey if it was stored properly.",
    'The Basenji is known as the "barkless dog" because it makes unique yodel-like sounds instead.',
    "A single cloud can weigh over a million pounds.",
    "A Greyhound can outrun a cheetah over long distances due to its endurance.",
    "The inventor of the frisbee was turned into a frisbee after he died.",
    "Dalmatian puppies are born completely white and develop their spots later.", // does not contain "dog", but is about dogs :(
    "Bananas are berries, but strawberries aren't.",
    "The world's oldest dog on record lived to be 31 years old.",
    "A day on Venus is longer than a year on Venus.",
    "The world's longest hot dog was 668 feet and 7.62 inches long and was made in 2011.", // contains "dog", but not about dogs :(
    "A dog's nose print is as unique as a human fingerprint.",
    "There's a species of jellyfish that is biologically immortal—it can revert to its juvenile form.",
    "Chihuahuas have the largest brain-to-body size ratio of any dog breed.",
    "There are more trees on Earth than there are stars in the Milky Way.",
    "A wagging tail doesn't always mean a dog is happy—it can also indicate nervousness or excitement.",
    "Wombat poop is cube-shaped to prevent it from rolling away.",
    "Dogs can dream, and they often move their paws or whimper while doing so.",
    "The Eiffel Tower can grow more than 6 inches taller in the summer due to heat expansion.",
    "Some dogs can learn over 1,000 words, with Border Collies being the best at this.",
    "Octopuses have three hearts, and their blood is blue due to copper-based hemocyanin.",
  ];

  const res = await fetch(`http://localhost:${env.PORT}/api/facts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(facts),
  });

  const data = await res.json();
  console.log(data);
}

upload();

import { auth } from "@/auth";
import ScapeHomeClient from "./HomeClient";
import { dummySpots } from "@/lib/dummyData";

export default async function Home() {
  const session = await auth();

  return (
    <ScapeHomeClient 
      session={session} 
      dummySpots={dummySpots} 
    />
  );
}

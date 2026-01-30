import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  if (!session) return <div>Chưa đăng nhập</div>;

  return (
    <div>
      Xin chào {JSON.stringify(session)}{" "}
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}

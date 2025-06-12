import { Bot } from "lucide-react";
import Link from "next/link";
const Sidebar = () => {
  return (
    <section className="fixed left-0 border-r top-0 p-4 flex flex-col gap-2 w-72 h-screen">
      <div className="z-[100] flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              AI Assistant
            </h1>
            <p className="text-sm text-muted-foreground">Always here to help</p>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        <Link className="w-full" href={"/"}>
          <li className="p-3 border relative border-border hover:bg-accent transition-all rounded-xl">
            Chatbot
          </li>
        </Link>
        <Link className="w-full" href={"/generate"}>
          <li className="p-3 border relative border-border hover:bg-accent transition-all rounded-xl">
            Generate
          </li>
        </Link>
      </ul>
    </section>
  );
};

export default Sidebar;

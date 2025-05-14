import BoardPage from "@/app/task/boards/[boardId]/page";

type PageProps = {
  params: {
    boardId: string;
    cardId: string;
  };
};

export default function CardPage({params}:PageProps) {
  return (
    <BoardPage params={params} />
  );
}
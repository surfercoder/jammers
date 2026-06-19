import { render, screen, userEvent } from "@test/render";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

it("renders default variant tabs and switches content", async () => {
  render(
    <Tabs defaultValue="one" className="custom-tabs">
      <TabsList className="custom-list">
        <TabsTrigger value="one" className="custom-trigger">
          One
        </TabsTrigger>
        <TabsTrigger value="two">Two</TabsTrigger>
      </TabsList>
      <TabsContent value="one" className="custom-content">
        Content One
      </TabsContent>
      <TabsContent value="two">Content Two</TabsContent>
    </Tabs>
  );

  expect(screen.getByText("Content One")).toBeInTheDocument();
  const list = screen.getByRole("tablist");
  expect(list).toHaveAttribute("data-variant", "default");

  await userEvent.click(screen.getByRole("tab", { name: "Two" }));
  expect(screen.getByText("Content Two")).toBeInTheDocument();
});

it("renders line variant", () => {
  render(
    <Tabs defaultValue="a" orientation="vertical">
      <TabsList variant="line">
        <TabsTrigger value="a">A</TabsTrigger>
      </TabsList>
      <TabsContent value="a">A content</TabsContent>
    </Tabs>
  );
  expect(screen.getByRole("tablist")).toHaveAttribute("data-variant", "line");
});

import { Leaf, Sparkles, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Shadcn/ui/card";

const values = [
  {
    title: "Sustainable mobility",
    description:
      "We design every rental program to reduce emissions and keep cities moving cleanly.",
    icon: Leaf,
  },
  {
    title: "Intelligent energy",
    description:
      "Real-time analytics balance charging demand with renewable energy availability.",
    icon: Zap,
  },
  {
    title: "Premium journeys",
    description:
      "From first booking to final drop-off, we craft seamless experiences for every rider.",
    icon: Sparkles,
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16 text-slate-900">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">About EV Rental</p>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">Electrifying mobility for businesses and modern explorers</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
            Our platform unifies electric fleet operations, intelligent charging, and delightful customer experiences so that sustainable travel becomes the default choice.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {values.map((value) => (
            <Card key={value.title} className="border border-gray-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <value.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">Our promise to the communities we serve.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border border-gray-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Looking ahead</CardTitle>
            <CardDescription>Investing in ultra-fast charging, battery circularity, and data-driven mobility.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 text-sm text-gray-600 md:grid-cols-3">
            <div>
              <p className="text-3xl font-semibold text-primary">150+</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">vehicles powered by renewables today</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-secondary">98%</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">customer satisfaction across enterprise clients</p>
            </div>
            <div>
              <p className="text-3xl font-semibold text-accent">24 cities</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">with expansion underway for 2025</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;

import { Link, useRouteError } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

// Shown when a page crashes or fails to load (e.g. a new deploy replaced old page files).
const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-bold">Something went wrong</h1>
      <p className="mt-4 text-ink-soft">
        This page ran into a problem. Try reloading; if it keeps happening, head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={() => window.location.reload()}
          className="bg-brand-600 hover:bg-brand-700 text-white"
        >
          Reload page
        </Button>
        <Link to="/">
          <Button variant="outline">Go Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;

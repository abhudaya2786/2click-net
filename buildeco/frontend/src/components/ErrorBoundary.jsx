import { Component } from "react";
import { Button } from "@/components/ui/button";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      const message = String(this.state.error?.message || this.state.error);
      const looksLikeNetwork =
        /network|fetch|failed to load|backend|timeout|502|503|504/i.test(message);

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <div className="max-w-md text-center space-y-4">
            <h1 className="font-display font-extrabold text-2xl">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">
              {looksLikeNetwork
                ? "We could not reach the server. Check that REACT_APP_BACKEND_URL points to a live API, then refresh."
                : "This page hit an unexpected error. Try refreshing, or go back to the home page."}
            </p>
            <p className="text-xs text-muted-foreground break-all">{message}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button className="rounded-none" variant="outline" onClick={() => window.location.reload()}>
                Refresh
              </Button>
              <Button className="rounded-none" onClick={() => window.location.assign("/")}>Go to Home</Button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

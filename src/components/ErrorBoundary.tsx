import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { ErrorPage } from "./ErrorPage";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Error no controlado en First Gig:", error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

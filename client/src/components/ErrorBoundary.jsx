import { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button.jsx';

const LOG_LABEL = 'ErrorBoundary caught a render error';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(LOG_LABEL, error, errorInfo.componentStack);
  }

  componentDidUpdate(previousProps) {
    const resetKeyChanged = previousProps.resetKey !== this.props.resetKey;
    if (this.state.error && resetKeyChanged) {
      this.clearError();
    }
  }

  clearError = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 px-4 py-24 text-center"
      >
        <h1 className="text-2xl font-bold text-content">
          Something went wrong
        </h1>
        <p className="text-content-muted">
          This page hit an unexpected error.
        </p>
        <Button as={Link} to="/backlog" onClick={this.clearError}>
          Back to backlog
        </Button>
      </div>
    );
  }
}

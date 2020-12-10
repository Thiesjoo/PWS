import { Display } from "./display";

new Display();

if (module.hot) {
	module.hot.accept();
	// module.hot.dispose();
}

declare var module: {
	hot: {
		accept(path?: string, callback?: () => void): void;
		dispose(path?: string, callback?: () => void): void;
	};
};

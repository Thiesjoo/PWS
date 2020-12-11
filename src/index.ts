import { Display } from "./display";

let display = new Display();

if (module.hot) {
	module.hot.accept();
	module.hot.dispose(() => {
		display.init();
	});
}

declare var module: {
	hot: {
		accept(path?: string, callback?: () => void): void;
		dispose(callback: (data: any) => void): void;
	};
};

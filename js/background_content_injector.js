// injects content script on a tab if was not injected already

log("js/background_content_injector.js entry");

function try_inject_content() {
	chrome.tabs.getSelected(null, tab => {
		if (tab.url.match(/https:\/\/vk.com.*/) != null) {
			log("Current tab is VK");

			// Inject CSS
			for (trick in tricks) {
				if (!tricks[trick].manifest.css) continue;
				if (!enabled_tricks.includes(trick)) continue;
				log("Injecting CSS for " + trick + "...");

				const cssfile = "tricks/" + trick + "/" + tricks[trick].manifest.css;

				chrome.runtime.getPackageDirectoryEntry(dir_e => dir_e.getFile(cssfile, {},
					file => file.file(file_file => { // ikr
						let css_reader = new FileReader();
						css_reader.onloadend = (e) => {
							// Inject CSS content
							chrome.tabs.insertCSS(tab.id, { code: css_reader.result });
						};
						css_reader.readAsText(file_file);
					})));
			}

			// Inject JS
			// Declare options
			var content_code = "";

			for (trick in tricks) {
				if (!tricks[trick].manifest.content) continue;
				if (!enabled_tricks.includes(trick)) continue;
				tricks[trick].manifest.options.forEach(o => {
					content_code += "let " + o.name + " = \"" + (o.value || o.default_value) + "\";"
				});
			}

			// Inject code
			for (trick in tricks) {
				if (!tricks[trick].manifest.content) continue;
				if (!enabled_tricks.includes(trick)) continue;
				log("Injecting JS for " + trick + "...");

				const contentfile = "tricks/" + trick + "/" + tricks[trick].manifest.content;

				console.log(content_code);

				chrome.runtime.getPackageDirectoryEntry(dir_e => dir_e.getFile(contentfile, {},
					file => file.file(file_file => { // ikr
						let content_reader = new FileReader();
						content_reader.onloadend = (e) => {
							// inject content script
							chrome.tabs.executeScript(tab.id, {
								code: "{" + content_code + "\n" + content_reader.result + "}"
							});
						};
						content_reader.readAsText(file_file);
					})));
			}
		}
	});
}

chrome.tabs.onActiveChanged.addListener(try_inject_content);
chrome.tabs.onUpdated.addListener(try_inject_content);

chrome.webNavigation.onHistoryStateUpdated.addListener(try_inject_content);

try_inject_content();

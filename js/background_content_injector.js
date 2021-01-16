// injects content script on a tab if was not injected already

log("js/background_content_injector.js entry");

function try_inject_content() {
	chrome.tabs.getSelected(null, tab => {
		if (tab.url.match(/https:\/\/vk.com.*/) != null) {
			log("Current tab is VK");

			for (trick in tricks) {
				if (!tricks[trick].manifest.content) continue;
				log("Injecting " + trick);

				var content_code = "";

				tricks[trick].manifest.options.forEach(o => {
					content_code += "var " + o.name + " = \"" + (o.value || o.default_value) + "\";"
				});

				const contentfile = "tricks/" + trick + "/" + tricks[trick].manifest.content;

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
const histories = [];

const commands = {
	help: {
		description: 'Show available commands',
    delay: 4,
		action: () => `Available commands:\n${Object.entries(commands).sort()
        .map(([cmd, info]) => `  ${cmd.padEnd(12)} - ${info.description}`)
        .join('\n')}`
	},
	imagetoascii: {
		description: 'Convert image to ASCII art',
		delay: 0.1,
		action: async (args) => {
			const downloadImage = async (url) => {
				const response = await fetch(url);
				const blob = await response.blob();
				const objectURL = URL.createObjectURL(blob);
				return objectURL;
			};
			
			const convertImageToASCII = async (imageUrl) => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				const img = new Image();
        
				img.crossOrigin = 'Anonymous'; // Mendukung CORS jika gambar eksternal
				img.src = imageUrl;

				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				});

				// Tentukan ukuran canvas berdasarkan gambar asli
				const aspectRatio = img.height / img.width;
				//width is 50% of the original image
				const width = Math.min(img.width, 100);
				const height = Math.round(width * aspectRatio);
				canvas.width = width;
				canvas.height = height;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
				ctx.filter = 'contrast(150%) brightness(120%) grayscale(100%)';

				const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
				const characterSet = '@%#*+=-:. ';
				const ascii = [];

				// Konversi setiap piksel menjadi karakter ASCII
				for (let y = 0; y < imageData.height; y++) {
					let row = '';
					for (let x = 0; x < imageData.width; x++) {
							const index = (y * imageData.width + x) * 4;
							const r = imageData.data[index];
							const g = imageData.data[index + 1];
							const b = imageData.data[index + 2];
							
							// More accurate luminance calculation
							const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
							const charIndex = Math.floor((luminance / 255) * (characterSet.length - 1));
							row += characterSet[charIndex];
					}
					ascii.push(row);
				}

				//clipboard copy
				const asciiText = ascii.join('\n');
				navigator.clipboard.writeText(asciiText);

				return ascii.join('\n');
			};

			if(!args || args.length === 0) {
				return 'Usage: imagetoascii <image-url>\nExample: imagetoascii https://example/image.jpg';
			} else {
				const imageUrl = args[0];
				try {
					displayOutput('Downloading image...', 'info');
					const objectURL = await downloadImage(imageUrl);
					displayOutput('Converting image to ASCII...', 'info');
					const ascii = await convertImageToASCII(objectURL);
					return ascii;
				} catch (error) {
					return `Error: ${error.message}`;
				}
			}

		}
	},
	weather: {
		description: 'Check weather for a city',
		action: async (args) => {
			if(!args || args.length === 0) {
				return 'Usage: weather <city>\nExample: weather jakarta';
			}
			const city = args[0];
			const apiKey = '842eb681292f97304b754eac6933acd2'; // Replace with your OpenWeatherMap API key
			try {
				displayOutput('Fetching weather data...', 'info');

        await new Promise(resolve => setTimeout(resolve, 1700));

				const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
				if(!response.ok) {
					throw new Error(`City not found or weather service unavailable`);
				}
				const data = await response.json();
				// Helper function to get weather emoji
				function getWeatherEmoji(condition) {
					const weatherEmojis = {
						'Clear': '☀️',
						'Clouds': '☁️',
						'Rain': '🌧️',
						'Drizzle': '🌦️',
						'Thunderstorm': '⛈️',
						'Snow': '🌨️',
						'Mist': '🌫️',
						'Smoke': '🌫️',
						'Haze': '🌫️',
						'Dust': '🌫️',
						'Fog': '🌫️',
						'Sand': '🌫️',
						'Ash': '🌫️',
						'Squall': '💨',
						'Tornado': '🌪️'
					};
					return weatherEmojis[condition] || '🌡️';
				}
				return `
Weather in ${data.name} (${data.sys.country}):
- Condition: ${data.weather[0].main} ${getWeatherEmoji(data.weather[0].main)}
- Temperature: ${data.main.temp}°C
- Humidity: ${data.main.humidity}%
- Wind Speed: ${data.wind.speed} m/s
      `;
			} catch (error) {
				return `Error: ${error.message}`;
			}
		}
	},
	about: {
		description: 'Learn about me',
		delay: 4,
		action: () => `Hi, I'm Ravhi! \n\nAs a skilled and experienced software developer, I have a proven track record of successfully leading high-impact projects, including CRM system migrations, the development of advanced platforms like Kalista Pulse, and transitioning legacy applications to modern, efficient architectures. My expertise lies in modernizing application infrastructures, enhancing performance, and delivering scalable, user-focused solutions.\n\nMy leadership experience includes managing cross-functional teams, streamlining workflows, and delivering cutting-edge solutions that align with organizational goals. With a focus on both backend and frontend excellence, I consistently deliver high-quality, reliable, and scalable applications tailored to user requirements.`
	},
	experience: {
		description: 'Show my work experience',
		delay: 4,
		action: async () => {
			displayOutput('Fetching experience...', 'info');
			await new Promise(resolve => setTimeout(resolve, 1000));
			const experience = [{
				title: 'Lead Programmer',
				company: 'PT. Kalapa Teknologi Putera',
				duration: '2022-2024',
				responsibilities: ['Coordinated Across IT and Non-IT Teams: Facilitated effective communication and collaboration between IT teams and other departments.', 'Developed and Implemented IT Strategies: Led the development and implementation of IT strategies to support business objectives.', 'Managed IT Projects: Oversaw the planning, execution, and monitoring of IT projects to ensure successful delivery.', 'Ensured Compliance: Ensured that IT projects and operations complied with relevant laws, regulations, and standards.', 'Managed IT Budget: Managed the IT budget to ensure that resources were allocated effectively and efficiently.', 'Led Omni-Channel Marketplace Project: Directed a B2C project focused on developing an Omni-Channel Marketplace platform.', 'Transformed Database Structure: Migrated application databases from PostgreSQL to MongoDB, optimizing for scalability and flexibility.']
			}, {
				title: 'Senior Web Developer',
				company: 'PT. Palapa Mitra Solusi',
				duration: '2021-2022',
				responsibilities: ['Implemented dynamic customer data uploads and simplified the existing application flow.', 'Successfully integrated a softphone into the CRM application, enabling calls through PHP AGI functions in Asterisk.', 'Implemented Agile Methodologies: Implemented Agile methodologies to improve project management and delivery processes.', 'Conducted code reviews to ensure code quality, consistency, and compliance with best practices.', 'Set up and configured a PBX server using Asterisk PBX.', 'Created a script to automatically initiate recording during the Asterisk dial plan execution.']
			}, {
				title: 'Junior Web Developer',
				company: 'PT. Global Alih Daya',
				duration: '2019-2021',
				responsibilities: ['Developed and maintained HRIS applications using CodeIgniter frameworks.', 'Implemented Psychological Test Applications with MBTI and PAPI Kostick methods.', 'Conducted code reviews and provided feedback to improve code quality.', 'Assisted in the development of RESTful APIs for web applications.', 'Created and maintained technical documentation for web applications.', 'Participated in the planning and execution of software development projects.']
			}, {
				title: 'IT Support Specialist',
				company: 'PT. Vads Indonesia',
				duration: '2018-2019',
				responsibilities: ['Provided technical support to end-users for hardware, software, and network-related issues.', 'Installed, configured, and maintained computer systems and software.', 'Troubleshot and resolved technical issues related to computer systems, software, and networks.', 'Active Directory Management: Managed user accounts, permissions, and group policies in Active Directory.', 'Zimbra Email Administration: Administered Zimbra email servers, including user account management and troubleshooting.', 'Exchange Server Administration: Managed Microsoft Exchange servers, including mailbox management and troubleshooting.', 'Conducted training sessions for end-users on software applications and IT best practices.']
			}];

			// Membuat daftar pengalaman kerja
			const experienceList = experience.map((exp, index) => {
				const responsibilities = exp.responsibilities.map(item => `    * ${item}`).join('\n');
				return `${index + 1}. ${exp.title}\n - Company: ${exp.company}\n - Duration: ${exp.duration}\n - Responsibilities:\n${responsibilities}\n`;
			});

			return `Work Experience:\n${experienceList.join('\n')}`;
		}
	},
	skills: {
		description: 'View my technical skills',
		delay: 4,
		action: async () => {
			displayOutput('Fetching skills...', 'info');
			await new Promise(resolve => setTimeout(resolve, 1000));

			const skills = {
				'Frontend': ['Vue.js', 'React', 'TypeScript', 'Tailwind CSS'],
				'Backend': ['Node.js', 'Express.js', 'Redwood.js', 'Laravel', 'CodeIgniter'],
				'Databases': ['MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'MySQL'],
				'Cloud': ['AWS', 'GCP', 'Docker', 'Kubernetes'],
				'Tools': ['Git', 'Jest', 'CI/CD', 'Agile', 'Scrum']
			};

			// Fungsi untuk padding dan pemotongan teks
			const padColumn = (text, width) => text.padEnd(width).slice(0, width);

			//menghitung panjang kolom berdasarkan teks terpanjang
			const categoryWidth = Math.max(...Object.keys(skills).map(category => category.length)) + 2;
			const itemsWidth = Math.max(...Object.values(skills).flat().map(item => item.length));

			// Header dan footer tabel
			const header = `┌${'─'.repeat(categoryWidth)}┬${'─'.repeat(itemsWidth)}┐`;
			const footer = `└${'─'.repeat(categoryWidth)}┴${'─'.repeat(itemsWidth)}┘`;

			// Isi tabel
			const rows = Object.entries(skills).map(([category, items]) => {
				const row = items.map((item, index) => {
					const isFirst = index === 0;
					const categoryCell = isFirst ? padColumn(category, categoryWidth) : ' '.repeat(categoryWidth);
					return `│ ${categoryCell} │ ${padColumn(item, itemsWidth)} │`;
				});

				return row.join('\n');
			});
			// Gabungkan header, isi, dan footer tabel
			return [header, ...rows, footer].join('\n');
		}
	},
	projects: {
		description: 'Browse my projects',
		delay: 10,
		action: () => {
			const projects = [{
				title: '🚀 Kanal Dagang',
				url: 'https://kanaldagang.com',
				description: ['Integrated with Tokopedia, Shopee, Lazada, and TikTok Shop', 'Automated order processing', 'Real-time inventory management', 'Customizable product catalog', 'Multi-channel sales analytics', 'Live chat between buyers and sellers from different platforms', 'Integrated with payment gateways and logistics providers', 'Built with Node.js, Express.js, MongoDB, Redis, Vue.js, Tailwind CSS']
			}, {
				title: '💬 Kalista Pulse - WhatsApp Broadcast App',
				url: 'https://pulse.kalapatec.id',
				description: ['WhatsApp API Business integration', 'Broadcast scheduling', 'Contact management', 'Message templates', 'Analytics dashboard', 'Built with Vue.js, Express.js, MongoDB, Redis, Tailwind CSS, and Apache Kafka']
			}, {
				title: '🌐 Outbound Telesales CRM',
				url : 'internal application',
				description: ['Webphone integration with Asterisk', 'Dynamic customer data uploads', 'Support for multiple campaigns', 'Call recording and live monitoring', 'Built with Express.js, Vue.js, PostgreSQL, MongoDB, Tailwind CSS, and Asterisk']
			}, {
				title: '🤖 Android ADB Tool',
				url: 'https://sourceforge.net/projects/android-tools',
				description: ['GUI for Android Debug Bridge (ADB)', 'Install, uninstall, and manage Android apps', 'Capture screenshots and screen recordings', 'Built with VB.Net 2010, ADB, and Android SDK']
			},
			//this terminal project
			{
				title: '🖥️ Portfolio Terminal',
				url: 'https://ravhirizaldi.github.io/portfolio',
				description: ['Interactive terminal interface', 'Built-in commands and animations', 'Responsive design', 'Built with HTML, CSS, JavaScript']
			}
		];

			const projectList = projects.map((project, index) => {
				const description = project.description.map(item => `  - ${item}`).join('\n');
				return `${index + 1}. ${project.title} (${project.url})\n${description}\n\n`;
			});

			return `My Projects:\n\n${projectList.join('\n')}`;
		}
	},
	contact: {
		description: 'Get my contact information',
    action: () => {
      const contact = {
        'Email': 'ravhirzld@gmail.com',
        'GitHub': 'https://github.com/ravhirzld',
        'LinkedIn': 'https://linkedin.com/in/ravhirzld'
      };

      // buat simbol untuk setiap kontak
      const symbols = {
        'Email': '📧',
        'GitHub': '🔗',
        'LinkedIn': '💼'
      };

      const contactList = Object.entries(contact).map(([key, value]) => `${symbols[key]} ${key.padEnd(10)}: ${value}`).join('\n');
      return `Contact Information:\n${contactList}`;
    }
	},
	clear: {
		description: 'Clear the console',
		action: () => {
			document.getElementById("output").innerHTML = "";
			displayOutput("Welcome to my portfolio terminal! Type 'help' for available commands.", 'info');
			return "";
		}
	},
	exit: {
		description: 'Close the terminal',
		action: () => {
			window.close();
			return "";
		}
	},
	useragent: {
		description: 'Show user agent',
		delay: 4,
		action: async () => {
			//full data of user agent and browser and os
			const userAgent = navigator.userAgent;
			//only browser and os
			const browser = navigator.userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i)[0];
			const os = navigator.userAgent.match(/(windows|mac|android|linux|iphone|ipad)/i)[0];
			const displaySize = `${window.innerWidth}x${window.innerHeight}`;
			const colorDepth = `${screen.colorDepth}-bit`;
			const pixelDepth = `${screen.pixelDepth}-bit`;
			const deviceMemory = `${navigator.deviceMemory}GB`;
			const language = navigator.language;
			const languages = navigator.languages.join(', ');
			const cookieEnabled = navigator.cookieEnabled;
			const doNotTrack = navigator.doNotTrack;
			const online = navigator.onLine;
			const storage = await navigator.storage.estimate().then(({
				quota
			}) => {
				//convert to GB and round to 2 decimal places
				return `${(quota / (1024 ** 3)).toFixed(2)}GB`;
			});
			const arr = [`User Agent: ${userAgent}`, `Browser: ${browser}`, `OS: ${os}`, `Display Size: ${displaySize}`, `Color Depth: ${colorDepth}`, `Pixel Depth: ${pixelDepth}`, `Device Memory: ${deviceMemory}`, `Language: ${language}`, `Languages: ${languages}`, `Cookie Enabled: ${cookieEnabled}`, `Do Not Track: ${doNotTrack}`, `Online: ${online}`, `Storage: ${storage}`];
			return arr.join('\n');
		}
	},
	download: {
		description: 'Download my resume',
		action: async () => {
			displayOutput('Downloading resume...', 'info');
			await new Promise(resolve => setTimeout(resolve, 1000));

			const downloadFile = async (url) => {
				const response = await fetch(url);
				const blob = await response.blob();
				const objectURL = URL.createObjectURL(blob);
				return objectURL;
			}

			//from local path
			const localPath = 'resume.pdf';

			const objectURL = await downloadFile(localPath);
			const link = document.createElement('a');
			link.href = objectURL;
			link.download = 'Ravhi_Rizaldi_Resume.pdf';

			link.click();

			//remove object URL after download
			URL.revokeObjectURL(objectURL);
			return 'Resume downloaded!';
		}
	},
};

// DOM elements
const outputDiv = document.getElementById("output");
const inputField = document.getElementById("input");
const suggestionsDiv = document.getElementById("suggestions");
const keySound = document.getElementById("key-sound");
const volumeButton = document.getElementById("volume-button");

let isMuted = false;

//toggle mute/unmute
volumeButton.addEventListener("click", () => {
	isMuted = !isMuted;
	keySound.muted = isMuted;
	volumeButton.textContent = isMuted ? "🔇" : "🔊";
});

//play key sound on key press
inputField.addEventListener("keydown", () => {
	keySound.currentTime = 0;
	//volume is 50% (0.5)
	keySound.volume = 0.2;
	keySound.play();
});
let selectedSuggestionIndex = -1;

// Typing effect
function typeEffect(element, text, callback, delay = 30) {
	let index = 0;
	element.innerHTML = '';
	const typing = setInterval(() => {
		if(index < text.length) {
			element.innerHTML += text.charAt(index);
			element.scrollIntoView({
				behavior: 'smooth',
				block: 'end'
			});
			index++;
		} else {
			clearInterval(typing);
			if(callback) callback();
		}
	}, delay);
}

// Display output in the terminal
function displayOutput(text, className = '', delay = 30) {
	const line = document.createElement("div");
	line.className = `output-line ${className}`;
	outputDiv.appendChild(line);
	typeEffect(line, text, () => {
		inputField.focus();
	}, delay);
	outputDiv.scrollTop = outputDiv.scrollHeight;
}

// Show suggestions based on input
function showSuggestions(input) {
	const matchingCommands = Object.keys(commands).filter(cmd => cmd.startsWith(input.toLowerCase()) && cmd !== input.toLowerCase());
	if(matchingCommands.length && input) {
		suggestionsDiv.innerHTML = matchingCommands.map((cmd, index) => `
          <div class="suggestion ${index === selectedSuggestionIndex ? 'selected' : ''}" 
               data-command="${cmd}">
            ${cmd} - ${commands[cmd].description}
          </div>
        `).join('');
		suggestionsDiv.style.display = 'block';
	} else {
		suggestionsDiv.style.display = 'none';
		selectedSuggestionIndex = -1;
	}
}

// Handle input field focus
inputField.addEventListener("input", (e) => {
	showSuggestions(e.target.value);
});

// Handle keyboard events
inputField.addEventListener("keydown", (e) => {
	const suggestions = document.querySelectorAll('.suggestion');
	if(e.key === "Tab") {
		e.preventDefault();
		if(suggestions.length > 0) {
			const command = suggestions[0].dataset.command;
			inputField.value = command;
			suggestionsDiv.style.display = 'none';
		}
	} else if(e.key === "ArrowUp" || e.key === "ArrowDown") {
		e.preventDefault();
		if(suggestions.length > 0) {
			selectedSuggestionIndex = e.key === "ArrowUp" ? Math.max(0, selectedSuggestionIndex - 1) : Math.min(suggestions.length - 1, selectedSuggestionIndex + 1);
			showSuggestions(inputField.value);
		}
	} else if(e.key === "Enter") {
		const input = inputField.value.trim();
		inputField.value = "";
		suggestionsDiv.style.display = 'none';
		if(input) {
			displayOutput(`➜ ${input}`, 'command');

			//check command with arguments
			const [cmd, ...args] = input.split(' ');
			if(commands[cmd]) {
				histories.push(input);

				//limit history to 10
				if(histories.length > 10) {
					histories.shift();
				}

				const result = commands[cmd].action(args);
				if(result instanceof Promise) {
					result.then(output => displayOutput(output, 'output', commands[cmd].delay));
				} else {
					displayOutput(result, 'output', commands[cmd].delay);
				}
			} else {
				displayOutput(`Command not found: ${cmd}. Type 'help' for available commands.`, 'error');
			}
		}
	}
});

// Hide suggestions when clicking outside
suggestionsDiv.addEventListener('click', (e) => {
	const suggestion = e.target.closest('.suggestion');
	if(suggestion) {
		inputField.value = suggestion.dataset.command;
		suggestionsDiv.style.display = 'none';
		inputField.focus();
	}
});

//CTRL+M to mute/unmute
document.addEventListener("keydown", (e) => {
	if(e.ctrlKey && e.key === "m") {
		isMuted = !isMuted;
		keySound.muted = isMuted;
		volumeButton.textContent = isMuted ? "🔇" : "🔊";
	}

	console.log(e.key);

	//history navigation with arrow keys up and down
	if(histories.length > 0 && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
		e.preventDefault();
		
		const currentIndex = histories.indexOf(inputField.value);

		if(e.key === "ArrowUp") {
			if(currentIndex < histories.length - 1) {
				inputField.value = histories[currentIndex + 1];
			} else {
				inputField.value = "";
			}
		} else if(e.key === "ArrowDown") {
			if(currentIndex > 0) {
				inputField.value = histories[currentIndex - 1];
			} else {
				inputField.value = histories[0];
			}
		}
	}
});

// disable copy-paste and text selection
document.addEventListener('copy', (e) => e.preventDefault());
document.addEventListener('cut', (e) => e.preventDefault());
document.addEventListener('selectstart', (e) => e.preventDefault());

// Welcome message
window.onload = () => {
	displayOutput("Welcome to my portfolio terminal! Type 'help' for available commands.", 'info', 10);
};
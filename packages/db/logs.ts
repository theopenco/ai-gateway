import type { tables } from "./src";
import type { InferInsertModel } from "drizzle-orm";

type Log = InferInsertModel<typeof tables.log>;

export const logs: Log[] = [
	{
		id: "error-log-example",
		requestId: "error-log-example",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 1500,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 250,
		content: "Failed to process request due to server error",
		finishReason: "error",
		unifiedFinishReason: "upstream_error",
		promptTokens: "45",
		completionTokens: "0",
		totalTokens: "45",
		temperature: 0.7,
		maxTokens: 1000,
		messages: JSON.stringify([
			{ role: "system", content: "You are a helpful AI assistant." },
			{
				role: "user",
				content: "Can you analyze this dataset and provide insights?",
			},
		]),
		cost: 0,
		inputCost: 0,
		outputCost: 0,
		hasError: true,
		errorDetails: {
			statusCode: 500,
			statusText: "Internal Server Error",
			responseText:
				"The server encountered an unexpected condition that prevented it from fulfilling the request. The model service is temporarily unavailable.",
		},
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "test-log-id-1",
		requestId: "test-log-id-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 100,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1000,
		content: "Test response content",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "10",
		completionTokens: "20",
		totalTokens: "30",
		temperature: 0.7,
		maxTokens: 100,
		messages: JSON.stringify([
			{ role: "system", content: "You are a helpful AI assistant." },
			{
				role: "user",
				content:
					"Hello! Can you help me with a quick question about JavaScript?",
			},
			{
				role: "assistant",
				content:
					"Of course! I'd be happy to help with your JavaScript question. What would you like to know?",
			},
			{
				role: "user",
				content:
					"How do I use the fetch API to make a POST request with JSON data?",
			},
		]),
		cost: 0.06,
		inputCost: 0.02,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt4-1",
		requestId: "log-gpt4-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 2345,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 3782,
		content:
			"I've analyzed your code and found several potential optimizations. First, you're creating multiple database connections which can lead to connection pool exhaustion. Second, your query isn't using indexes effectively. I recommend adding an index on the 'created_at' column and restructuring your query to use a JOIN instead of a subquery. This should significantly improve performance for large datasets.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "512",
		completionTokens: "128",
		totalTokens: "640",
		temperature: 0.2,
		maxTokens: 1000,
		messages: JSON.stringify([
			{
				role: "system",
				content:
					"You are a database optimization expert. Provide specific, actionable advice to improve query performance.",
			},
			{
				role: "user",
				content:
					"Our e-commerce app is experiencing slow response times. I've identified this query as the bottleneck:\n\n```sql\nSELECT * FROM users \nWHERE id IN (\n  SELECT user_id FROM orders \n  WHERE created_at > '2023-01-01' AND status = 'completed'\n) \nORDER BY last_login DESC LIMIT 100;\n```\n\nThe users table has about 500,000 records and the orders table has about 2 million. Here's our database connection code:\n\n```javascript\nfunction getDbConnection() {\n  return mysql.createConnection({\n    host: 'localhost',\n    user: 'app_user',\n    password: 'password123',\n    database: 'ecommerce'\n  });\n}\n\nasync function executeQuery(query) {\n  const connection = getDbConnection();\n  try {\n    const results = await connection.query(query);\n    return results;\n  } finally {\n    connection.close();\n  }\n}\n```\n\nCan you help optimize both the query and our connection handling?",
			},
		]),
		cost: 0.32,
		inputCost: 0.16,
		outputCost: 0.16,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-claude-sonnet-2",
		requestId: "log-claude-sonnet-2",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 4231,
		requestedModel: "claude-3-sonnet",
		requestedProvider: "anthropic",
		usedModel: "claude-3-sonnet",
		usedProvider: "anthropic",
		responseSize: 8954,
		content:
			"Here's a comprehensive React component that implements the data visualization dashboard you described. I've included responsive design considerations, accessibility features, and proper TypeScript typing throughout. The component uses React hooks for state management and includes error handling for API failures. I've also added detailed comments to explain the implementation choices.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "1024",
		completionTokens: "2048",
		totalTokens: "3072",
		temperature: 0.5,
		maxTokens: 4000,
		messages: JSON.stringify([
			{
				role: "system",
				content:
					"You are a senior React developer with expertise in data visualization and TypeScript.",
			},
			{
				role: "user",
				content:
					"I'm building an analytics dashboard for our SaaS product and need help with the frontend implementation. Our backend team has already created the API endpoints that return the necessary data.",
			},
			{
				role: "assistant",
				content:
					"I'd be happy to help with your analytics dashboard implementation. To get started, could you share more details about the specific requirements and the data structure returned by your API endpoints?",
			},
			{
				role: "user",
				content:
					"Here are the requirements:\n\n1. The dashboard should display key metrics (active users, revenue, conversion rate) in real-time\n2. Users should be able to filter data by date range (today, last 7 days, last 30 days, custom range)\n3. We need both chart visualizations (line charts for trends, bar charts for comparisons) and tabular data\n4. The dashboard should be responsive and work well on desktop and tablet\n5. We need to implement proper error handling for API failures\n6. The whole implementation should use TypeScript with proper typing\n\nHere's a sample of the data structure returned by our API:\n\n```typescript\ntype Metric = {\n  name: string;\n  value: number;\n  change: number; // percentage change from previous period\n};\n\ntype TimeSeriesData = {\n  timestamp: string;\n  value: number;\n};\n\ntype AnalyticsResponse = {\n  metrics: Metric[];\n  timeSeriesData: {\n    activeUsers: TimeSeriesData[];\n    revenue: TimeSeriesData[];\n    conversionRate: TimeSeriesData[];\n  };\n};\n```\n\nCan you help me design a React component for this dashboard?",
			},
		]),
		cost: 0.92,
		inputCost: 0.46,
		outputCost: 0.46,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt35-turbo-1",
		requestId: "log-gpt35-turbo-1",
		createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 987,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1245,
		content:
			"To fix this CSS issue, you need to add 'position: relative' to the parent container and then use 'position: absolute' with appropriate top/left values for the child element. Also, make sure to set a z-index if you want to control stacking order.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "156",
		completionTokens: "89",
		totalTokens: "245",
		temperature: 0.7,
		maxTokens: 500,
		messages: JSON.stringify([
			{
				role: "system",
				content:
					"You are a helpful web development assistant with expertise in HTML, CSS, and JavaScript.",
			},
			{
				role: "user",
				content:
					"I'm building a navigation menu for my website and I'm having trouble with the dropdown. Here's my current code:",
			},
			{
				role: "user",
				content:
					'```html\n<nav class="main-nav">\n  <ul>\n    <li><a href="#">Home</a></li>\n    <li class="has-dropdown">\n      <a href="#">Products</a>\n      <ul class="dropdown">\n        <li><a href="#">Product 1</a></li>\n        <li><a href="#">Product 2</a></li>\n        <li><a href="#">Product 3</a></li>\n      </ul>\n    </li>\n    <li><a href="#">About</a></li>\n    <li><a href="#">Contact</a></li>\n  </ul>\n</nav>\n```',
			},
			{
				role: "user",
				content:
					"```css\n.main-nav {\n  background-color: #333;\n}\n\n.main-nav > ul {\n  display: flex;\n  list-style: none;\n  padding: 0;\n  margin: 0;\n}\n\n.main-nav > ul > li {\n  padding: 15px;\n  position: relative;\n}\n\n.main-nav a {\n  color: white;\n  text-decoration: none;\n}\n\n.dropdown {\n  display: none;\n  position: absolute;\n  background-color: #444;\n  list-style: none;\n  padding: 10px;\n  z-index: 10;\n}\n\n.has-dropdown:hover .dropdown {\n  display: block;\n}\n```",
			},
			{
				role: "user",
				content:
					"The problem is that my dropdown menu appears behind a slider component that's further down on the page, even though I've set z-index: 10 on the dropdown. I've also tried increasing the z-index to 100 but it still doesn't work. How can I fix this?",
			},
		]),
		cost: 0.12,
		inputCost: 0.06,
		outputCost: 0.06,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-llama3-70b-1",
		requestId: "log-llama3-70b-1",
		createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 3567,
		requestedModel: "llama-3.3-70b-instruct",
		requestedProvider: "inference.net",
		usedModel: "llama-3.3-70b-instruct",
		usedProvider: "inference.net",
		responseSize: 5432,
		content:
			"I've reviewed your machine learning pipeline and identified several areas for improvement. Your feature engineering approach could benefit from dimensionality reduction techniques like PCA or t-SNE before feeding data into your model. Additionally, your current model architecture might be suffering from overfitting - I suggest implementing dropout layers and regularization. Finally, your evaluation metrics should include precision-recall curves since you're dealing with an imbalanced dataset.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "789",
		completionTokens: "432",
		totalTokens: "1221",
		temperature: 0.4,
		maxTokens: 2000,
		messages: JSON.stringify([
			{
				role: "system",
				content:
					"You are an expert in machine learning and natural language processing. Provide detailed technical advice to help users improve their ML models.",
			},
			{
				role: "user",
				content:
					"I'm working on a sentiment analysis project for customer reviews of our e-commerce platform. I've built a pipeline but I'm not satisfied with the results. Could you review my approach and suggest improvements?",
			},
			{
				role: "assistant",
				content:
					"I'd be happy to review your sentiment analysis pipeline. To provide the most helpful feedback, could you share details about your current implementation? Specifically, I'd like to know about:\n\n1. Your dataset (size, distribution of positive/negative reviews)\n2. Your preprocessing steps\n3. The model architecture you're using\n4. Your evaluation metrics\n5. Any specific issues you're encountering",
			},
			{
				role: "user",
				content:
					"Here are the details of my implementation:\n\n**Dataset:**\n- 50,000 product reviews (30,000 positive, 15,000 negative, 5,000 neutral)\n- Text length varies from 5 to 500 words\n- Split: 80% training, 10% validation, 10% test\n\n**Preprocessing:**\n- Basic cleaning (lowercase, remove special chars)\n- Tokenization using BERT tokenizer\n- Truncate/pad to 128 tokens\n\n**Model Architecture:**\n```python\nclass SentimentClassifier(nn.Module):\n    def __init__(self):\n        super(SentimentClassifier, self).__init__()\n        self.bert = BertModel.from_pretrained('bert-base-uncased')\n        self.dropout = nn.Dropout(0.1)\n        self.fc1 = nn.Linear(768, 256)\n        self.fc2 = nn.Linear(256, 3)  # 3 classes: positive, negative, neutral\n        \n    def forward(self, input_ids, attention_mask):\n        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)\n        pooled_output = outputs.pooler_output\n        x = self.fc1(pooled_output)\n        x = F.relu(x)\n        x = self.dropout(x)\n        x = self.fc2(x)\n        return x\n```\n\n**Training:**\n- AdamW optimizer with lr=2e-5\n- 4 epochs with batch size 32\n- No learning rate scheduling\n\n**Results:**\n- Training accuracy: 92%\n- Validation accuracy: 78%\n- Test accuracy: 77%\n\nI'm concerned about the gap between training and validation accuracy, and the overall performance seems lower than expected for BERT on sentiment analysis. What am I missing?",
			},
		]),
		cost: 0.24,
		inputCost: 0.12,
		outputCost: 0.12,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-claude-sonnet-1",
		requestId: "log-claude-sonnet-1",
		createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 1876,
		requestedModel: "claude-3-sonnet",
		requestedProvider: "anthropic",
		usedModel: "claude-3-sonnet",
		usedProvider: "anthropic",
		responseSize: 3210,
		content:
			"Based on your requirements, I've created a Docker Compose configuration that sets up a development environment with PostgreSQL, Redis, and your Node.js application. The configuration includes volume mounts for data persistence, environment variables for configuration, and proper networking between services. I've also added health checks to ensure dependencies are ready before your application starts.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "345",
		completionTokens: "567",
		totalTokens: "912",
		temperature: 0.3,
		maxTokens: 1500,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"I need help setting up a Docker Compose file for my Node.js application. It should include PostgreSQL and Redis services.",
			},
		]),
		cost: 0.18,
		inputCost: 0.09,
		outputCost: 0.09,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt4o-1",
		requestId: "log-gpt4o-1",
		createdAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 5432,
		requestedModel: "gpt-4o",
		requestedProvider: "openai",
		usedModel: "gpt-4o",
		usedProvider: "openai",
		responseSize: 2876,
		content:
			"The UI mockup you've shared has several usability issues. The contrast ratio between the text and background doesn't meet WCAG accessibility standards. The navigation menu items are too close together, making them difficult to tap on mobile devices. I also notice that the form lacks proper validation indicators and the submit button doesn't have a clear hover state. I recommend increasing text contrast, adding more padding between navigation items, implementing clear form validation states, and enhancing button interactivity.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "1543",
		completionTokens: "321",
		totalTokens: "1864",
		temperature: 0.2,
		maxTokens: 1000,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"Can you review this UI mockup and provide feedback on usability and accessibility? [image content]",
			},
		]),
		cost: 0.37,
		inputCost: 0.18,
		outputCost: 0.19,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gemini-1",
		requestId: "log-gemini-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 2134,
		requestedModel: "gemini-2.0-flash",
		requestedProvider: "google-vertex",
		usedModel: "gemini-2.0-flash",
		usedProvider: "google-vertex",
		responseSize: 4321,
		content:
			"Your Kubernetes deployment is experiencing issues due to resource constraints. The pods are being terminated because they're exceeding their memory limits. I recommend increasing the memory request and limit in your deployment YAML. Additionally, you should implement horizontal pod autoscaling based on memory utilization to handle varying loads. Finally, consider implementing a liveness probe with appropriate parameters to prevent Kubernetes from killing pods during temporary spikes.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "432",
		completionTokens: "321",
		totalTokens: "753",
		temperature: 0.4,
		maxTokens: 1200,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"My Kubernetes pods keep getting OOMKilled. Here's my deployment YAML and the recent logs. Can you help me diagnose and fix the issue?",
			},
		]),
		cost: 0.15,
		inputCost: 0.07,
		outputCost: 0.08,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt4-2",
		requestId: "log-gpt4-2",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 8765,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 9876,
		content:
			"I've analyzed your sales data and created visualizations showing trends over time. There's a clear seasonal pattern with peaks in December and July. Your year-over-year growth is approximately 12.3%, but profit margins have decreased by 2.1% in the same period. The best-performing product category is 'Electronics' with 34% of total revenue, while 'Home Goods' has the highest profit margin at 28%. I've also identified potential inventory optimization opportunities that could reduce carrying costs by approximately 15%.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "2345",
		completionTokens: "1234",
		totalTokens: "3579",
		temperature: 0.1,
		maxTokens: 4000,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"I have this CSV file with our company's sales data for the past 3 years. Can you analyze it and provide insights on trends, best-performing products, and areas for improvement?",
			},
		]),
		cost: 1.07,
		inputCost: 0.54,
		outputCost: 0.53,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-claude-haiku-1",
		requestId: "log-claude-haiku-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 543,
		requestedModel: "claude-3-haiku",
		requestedProvider: "anthropic",
		usedModel: "claude-3-haiku",
		usedProvider: "anthropic",
		responseSize: 987,
		content:
			"To implement JWT authentication in your Express.js API, you'll need to: 1) Install the jsonwebtoken package, 2) Create a middleware function to verify tokens, 3) Generate tokens during login, and 4) Apply the middleware to protected routes. I've included sample code for each step below.",
		finishReason: "stop",
		unifiedFinishReason: "stop",
		promptTokens: "123",
		completionTokens: "234",
		totalTokens: "357",
		temperature: 0.6,
		maxTokens: 800,
		messages: JSON.stringify([
			{
				role: "user",
				content: "How do I implement JWT authentication in my Express.js API?",
			},
		]),
		cost: 0.07,
		inputCost: 0.03,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt4-error-1",
		requestId: "log-gpt4-error-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 234,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 0,
		content: null,
		finishReason: "content_filter",
		promptTokens: "567",
		completionTokens: "0",
		totalTokens: "567",
		temperature: 0.7,
		maxTokens: 2000,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"Write me a script that can be used to exploit security vulnerabilities in a website.",
			},
		]),
		cost: 0.05,
		inputCost: 0.05,
		outputCost: 0,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-gpt4o-mini-1",
		requestId: "log-gpt4o-mini-1",
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 1234,
		requestedModel: "gpt-4o-mini",
		requestedProvider: "openai",
		usedModel: "gpt-4o-mini",
		usedProvider: "openai",
		responseSize: 2345,
		content:
			"Here's a Python function that implements the algorithm you described. It has O(n log n) time complexity and O(n) space complexity. I've included comments to explain the key steps and added error handling for edge cases.",
		finishReason: "length",
		unifiedFinishReason: "length_limit",
		promptTokens: "345",
		completionTokens: "500",
		totalTokens: "845",
		temperature: 0.5,
		maxTokens: 500,
		messages: JSON.stringify([
			{
				role: "user",
				content:
					"Can you implement an efficient algorithm to find the longest increasing subsequence in an array of integers?",
			},
		]),
		cost: 0.11,
		inputCost: 0.05,
		outputCost: 0.06,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-5",
		requestId: "log-5",
		createdAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 120,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1100,
		promptTokens: "12",
		completionTokens: "22",
		totalTokens: "34",
		messages: JSON.stringify([{ role: "user", content: "Hello again" }]),
		cost: 0.07,
		inputCost: 0.03,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-6",
		requestId: "log-6",
		createdAt: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 130,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 900,
		promptTokens: "6",
		completionTokens: "16",
		totalTokens: "22",
		messages: JSON.stringify([{ role: "user", content: "Hi again" }]),
		cost: 0.05,
		inputCost: 0.02,
		outputCost: 0.03,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-7",
		requestId: "log-7",
		createdAt: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 140,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1200,
		promptTokens: "14",
		completionTokens: "24",
		totalTokens: "38",
		messages: JSON.stringify([{ role: "user", content: "Test again" }]),
		cost: 0.08,
		inputCost: 0.04,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-8",
		requestId: "log-8",
		createdAt: new Date(new Date().getTime() - 28 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 28 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 150,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1000,
		promptTokens: "8",
		completionTokens: "18",
		totalTokens: "26",
		messages: JSON.stringify([{ role: "user", content: "Query again" }]),
		cost: 0.06,
		inputCost: 0.03,
		outputCost: 0.03,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-9",
		requestId: "log-9",
		createdAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 160,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1300,
		promptTokens: "16",
		completionTokens: "26",
		totalTokens: "42",
		messages: JSON.stringify([{ role: "user", content: "Another test" }]),
		cost: 0.09,
		inputCost: 0.04,
		outputCost: 0.05,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-10",
		requestId: "log-10",
		createdAt: new Date(new Date().getTime() - 17 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 17 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 170,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1100,
		promptTokens: "10",
		completionTokens: "20",
		totalTokens: "30",
		messages: JSON.stringify([{ role: "user", content: "Another query" }]),
		cost: 0.07,
		inputCost: 0.03,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-11",
		requestId: "log-11",
		createdAt: new Date(new Date().getTime() - 25 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 25 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 180,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1400,
		promptTokens: "18",
		completionTokens: "28",
		totalTokens: "46",
		messages: JSON.stringify([{ role: "user", content: "Yet another test" }]),
		cost: 0.1,
		inputCost: 0.05,
		outputCost: 0.05,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-12",
		requestId: "log-12",
		createdAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 190,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1200,
		promptTokens: "12",
		completionTokens: "22",
		totalTokens: "34",
		messages: JSON.stringify([{ role: "user", content: "Yet another query" }]),
		cost: 0.07,
		inputCost: 0.03,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-13",
		requestId: "log-13",
		createdAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 200,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1500,
		promptTokens: "20",
		completionTokens: "30",
		totalTokens: "50",
		messages: JSON.stringify([{ role: "user", content: "Final test" }]),
		cost: 0.11,
		inputCost: 0.05,
		outputCost: 0.06,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-14",
		requestId: "log-14",
		createdAt: new Date(new Date().getTime() - 12 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 12 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 210,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1300,
		promptTokens: "14",
		completionTokens: "24",
		totalTokens: "38",
		messages: JSON.stringify([{ role: "user", content: "Final query" }]),
		cost: 0.08,
		inputCost: 0.04,
		outputCost: 0.04,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-15",
		requestId: "log-15",
		createdAt: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 20 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 220,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1600,
		promptTokens: "22",
		completionTokens: "32",
		totalTokens: "54",
		messages: JSON.stringify([{ role: "user", content: "Another final test" }]),
		cost: 0.12,
		inputCost: 0.06,
		outputCost: 0.06,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-16",
		requestId: "log-16",
		createdAt: new Date(new Date().getTime() - 27 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 27 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 230,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1400,
		promptTokens: "16",
		completionTokens: "26",
		totalTokens: "42",
		messages: JSON.stringify([
			{ role: "user", content: "Another final query" },
		]),
		cost: 0.09,
		inputCost: 0.04,
		outputCost: 0.05,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-17",
		requestId: "log-17",
		createdAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 240,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1700,
		promptTokens: "24",
		completionTokens: "34",
		totalTokens: "58",
		messages: JSON.stringify([{ role: "user", content: "New test" }]),
		cost: 0.13,
		inputCost: 0.06,
		outputCost: 0.07,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-18",
		requestId: "log-18",
		createdAt: new Date(new Date().getTime() - 9 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 9 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 250,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1500,
		promptTokens: "18",
		completionTokens: "28",
		totalTokens: "46",
		messages: JSON.stringify([{ role: "user", content: "New query" }]),
		cost: 0.1,
		inputCost: 0.05,
		outputCost: 0.05,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-19",
		requestId: "log-19",
		createdAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 15 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 260,
		requestedModel: "gpt-4",
		requestedProvider: "openai",
		usedModel: "gpt-4",
		usedProvider: "openai",
		responseSize: 1800,
		promptTokens: "26",
		completionTokens: "36",
		totalTokens: "62",
		messages: JSON.stringify([{ role: "user", content: "Another new test" }]),
		cost: 0.14,
		inputCost: 0.07,
		outputCost: 0.07,
		mode: "api-keys",
		usedMode: "api-keys",
	},
	{
		id: "log-20",
		requestId: "log-20",
		createdAt: new Date(new Date().getTime() - 22 * 24 * 60 * 60 * 1000),
		updatedAt: new Date(new Date().getTime() - 22 * 24 * 60 * 60 * 1000),
		organizationId: "test-org-id",
		projectId: "test-project-id",
		apiKeyId: "test-api-key-id",
		duration: 270,
		requestedModel: "gpt-3.5-turbo",
		requestedProvider: "openai",
		usedModel: "gpt-3.5-turbo",
		usedProvider: "openai",
		responseSize: 1600,
		promptTokens: "20",
		completionTokens: "30",
		totalTokens: "50",
		messages: JSON.stringify([{ role: "user", content: "Another new query" }]),
		cost: 0.11,
		inputCost: 0.05,
		outputCost: 0.06,
		mode: "api-keys",
		usedMode: "api-keys",
	},
];

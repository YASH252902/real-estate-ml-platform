# Property Insights Dashboard

Build a comprehensive React/Vite dashboard for a Real Estate Machine Learning Platform using Tailwind CSS, Recharts, and Lucide icons.

Global Settings:

Create a configuration modal to set the API Base URL (defaulting to [http://127.0.0.1:8000](http://127.0.0.1:8000) for local dev, and updatable for production).

Page 1: Model Diagnostics & XAI Dashboard

Fetch from GET /metrics. Display three cards side-by-side comparing OLS, Ridge, and Lasso models based on their $R^2$, MSE, and MAE scores. Below the cards, render a Recharts Bar Chart showing the 'Feature Importance' (Coefficients) for the currently selected model so users can see which features drive house prices the most.

Page 2: Interactive Predictor

Create a clean form for single predictions with sliders and numeric inputs for: Median Income, House Age, Avg Rooms, Avg Bedrooms, and Population. Include a dropdown to select the model_type (OLS_Linear, Ridge_L2, Lasso_L1). On submit, POST to /predict and display the estimated_value_usd in a large, bold, green font.

Page 3: Batch CSV Processing

Implement a drag-and-drop file upload zone. When a CSV is uploaded, send it as multipart/form-data to POST /predict-batch. Display the returned JSON as a paginated data table, and include a button to export the results back to a new CSV."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9f04eeeb-be06-4024-ac2f-5c7e21a8f834).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

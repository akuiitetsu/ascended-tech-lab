# Vercel Deployment Guide for Ascended Tech Lab

This Flask web application is configured for deployment on Vercel. Follow these steps:

## Prerequisites

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Ensure you have a Vercel account

## Environment Variables

Set the following environment variables in your Vercel project:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SECRET_KEY`: A secure secret key for Flask sessions

You can set these via:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Or via CLI: `vercel env add VARIABLE_NAME`

## Deployment Steps

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Alternative: Link and Deploy**:
   ```bash
   vercel link
   vercel --prod
   ```

## File Structure

- `wsgi.py` - Main Flask application (Vercel entry point)
- `app.py` - Original Flask application (backup)
- `vercel.json` - Vercel configuration
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version specification
- `.vercelignore` - Files to ignore during deployment

## Configuration Details

### vercel.json
- Configures Python runtime
- Sets up routing for API and static files
- Defines environment variable mapping
- Sets function timeout to 30 seconds

### wsgi.py
- Cleaned version of app.py optimized for serverless deployment
- Includes proper error handling and CORS support
- Exports Flask app as 'application' for WSGI compatibility

## Important Notes

1. **Database**: The app uses Supabase as the database. Ensure your database is properly set up with the required tables.

2. **Static Files**: Static files are served directly by Vercel, not through Flask.

3. **Environment**: The app automatically detects serverless environment and adjusts initialization accordingly.

4. **CORS**: The app includes CORS support for cross-origin requests.

## Troubleshooting

1. **Build Failures**: Check that all dependencies are in requirements.txt
2. **Runtime Errors**: Verify environment variables are set correctly
3. **Database Issues**: Ensure Supabase credentials are valid and database schema exists
4. **Static File Issues**: Check that file paths are correct in vercel.json

## Local Testing

To test locally before deployment:

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables in .env file
# Then run
python wsgi.py
```

## Support

If you encounter issues, check:
- Vercel deployment logs
- Supabase dashboard for database connectivity
- Environment variable configuration

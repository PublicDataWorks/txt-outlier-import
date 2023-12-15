# Import Contacts

## Steps to follow

### Step 1: Install Python
Download from the Python [official website](https://www.python.org/downloads/). 

### Step 2: Install Required Python Libraries
Open your terminal/command prompt and run the following command:

```bash
pip install SQLAlchemy pandas
```

### Step 3: Set Environment variables
Set a DB_URL environment variable that points to the Supabase database.
```bash
export DB_URL=<DB_URL>
```
### Step 4: Generate Contact Book
In your terminal/command prompt, navigate to the directory where the `contact_book_generator.py` file is located. Run the following command:

```bash
python contact_book_generator.py
```
The script will generate a list of output files in a format that can be directly imported into Missive.

### Step 5: Import Contacts to Missive
Follow the instructions in this [document](https://missiveapp.com/faq/import-contacts) to import the output files to Missive.

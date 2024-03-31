#!/bin/bash

echo "Activating virtual environment..."
source venv/bin/activate

echo "Python version: $(python --version)"
echo "Which Python: $(which python)"
echo "Running Django server..."
./OneOnOne/manage.py runserver

echo "Django server is running."

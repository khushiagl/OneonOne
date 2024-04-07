#!/bin/bash

# Update and install system-wide packages
sudo apt update
sudo apt install -y python3-pip python3-venv git

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip and install required Python packages
pip install --upgrade pip
pip install -r ./OneonOne/requirements.txt

# Apply Django migrations
./OneonOne/manage.py makemigrations
./OneonOne/manage.py makemigrations api
./OneonOne/manage.py migrate


echo "Setup complete. Run the server using ./run.sh"

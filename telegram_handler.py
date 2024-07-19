import os
import sys
import configparser
from telethon import TelegramClient, sync, errors
from telethon.tl.types import Document, Photo, InputPhotoFileLocation, InputDocumentFileLocation

# Read API credentials from a configuration file
config = configparser.ConfigParser()
config.read('config.ini')

api_id = config['Telegram']['api_id']
api_hash = config['Telegram']['api_hash']
bot_token = config['Telegram']['bot_token']
group_chat_id = int(config['Telegram']['group_chat_id'])  # Ensure this is an integer

with open('./logfile.log', 'w') as log_file:
    log_file.write(" ")

# Capture the logs of python client
def log_message(message):
    with open('./logfile.log', 'a') as log_file:
        log_file.write(message + '\n')

# Create a new Telegram client instance with a session file
client = TelegramClient('session_name', api_id, api_hash)

async def upload_file(file_path):
    await client.start(bot_token=bot_token)
    file = await client.upload_file(file_path)
    try:
        message = await client.send_file(group_chat_id, file)
        file_id = None
        access_hash = None
        file_reference = None

        # Extract the file ID, access hash, and file reference
        if message.media.photo.id:
            file_id = message.media.photo.id
            access_hash = message.media.photo.access_hash
            file_reference = message.media.photo.file_reference
        elif message.media.document.id:
            file_id = message.media.document.id
            access_hash = message.media.document.access_hash
            file_reference = message.media.document.file_reference
        else:
            log_message("Unsupported media type or media not found.")

        log_message(f"File ID: {file_id}, Access Hash: {access_hash}, File Reference: {file_reference}")
        return file_id, access_hash, file_reference.hex()

    except errors.ChatWriteForbiddenError as e:
        log_message(f"Error: Cannot upload file. Chat write permission denied: {e}")
    except errors.FloodWaitError as e:
        log_message(f"Error: Flood wait. Retry after {e.seconds} seconds.")
    except errors.RPCError as e:
        log_message(f"Error uploading file: {e}")
    except Exception as e:
        log_message(f"Unexpected error: {e}")

async def download_file(file_id, access_hash, file_reference, dest_path):
    await client.start(bot_token=bot_token)
    try:
        if file_reference:
            # Convert file_reference back to bytes
            file_reference = bytes.fromhex(file_reference)
            log_message(file_reference)
            # Using the file reference to create a file location
            if b'\x01' in file_reference:  # This is a document
                input_location = InputDocumentFileLocation(id=int(file_id), access_hash=int(access_hash), file_reference=file_reference)
            else:  # This is a photo
                input_location = InputPhotoFileLocation(id=int(file_id), access_hash=int(access_hash), file_reference=file_reference)

                # Download the file
                file = await client.download_media(input_location, file=dest_path)
                log_message(f"File downloaded to: {dest_path}")
                return file
        else:
            log_message("No file reference provided.")
    except errors.RPCError as e:
        log_message(f"Error downloading file: {e}")
    except Exception as e:
        log_message(f"Unexpected error: {e}")

if __name__ == "__main__":
    import asyncio
    import argparse

    parser = argparse.ArgumentParser(description='Telegram File Upload/Download')
    parser.add_argument('action', choices=['upload', 'download'], help='Action to perform')
    parser.add_argument('file_path', help='Path to the file')
    parser.add_argument('dest_path', nargs='?', help='Destination path for download')
    parser.add_argument('--access_hash', help='Access hash of the file')
    parser.add_argument('--file_reference', help='File reference of the file')

    args = parser.parse_args()

    if args.action == 'upload':
        loop = asyncio.get_event_loop()
        file_id, access_hash, file_reference = loop.run_until_complete(upload_file(args.file_path))
        print(f'File ID: {file_id}, Access Hash: {access_hash}, File Reference: {file_reference}')
    elif args.action == 'download':
        loop = asyncio.get_event_loop()
        file_id = args.file_path
        access_hash = args.access_hash
        file_reference = args.file_reference  # file_reference is passed as hex string
        downloaded_path = loop.run_until_complete(download_file(file_id, access_hash, file_reference, args.dest_path))
        print(f'File downloaded to: {downloaded_path}')

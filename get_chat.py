from telethon.sync import TelegramClient
import configparser

# Read API credentials from a configuration file
config = configparser.ConfigParser()
config.read('config.ini')

api_id = config['Telegram']['api_id']
api_hash = config['Telegram']['api_hash']
phone_number = config['Telegram']['phone_number']

# Initialize the client and connect
client = TelegramClient('session_name', api_id, api_hash)
client.connect()

if not client.is_user_authorized():
    client.send_code_request(phone_number)
    client.sign_in(phone_number, input('Enter the code: '))

# Get the chat ID
entity = client.get_entity('Storage')
print(f'Chat ID: {entity.id}')

client.disconnect()

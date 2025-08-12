---
title: "Creating a Live Preview Environment with Proxmox, Debian, Nginx, and ngrok"
description: "A step-by-step guide to setting up a web development preview server using a Proxmox container, Nginx, and ngrok, with automated file synchronization."
excerpt: "Learn to build a secure, automated live preview environment for web projects using a local Proxmox server and containers."
category: Web Dev
category_color: green
date: "August 7, 2025"
read_time: 10
published_time: "2025-08-07T00:00:00Z"
status: published
slug: proxmox-live-preview
tags: Proxmox, Debian, Nginx, ngrok, Web Development, Automation, SSH
---

### Creating a Live Preview Environment with Proxmox, Debian, Nginx, and ngrok

![AI Image of Desk with Web Dev on Monitors](../Gallery/Blog-images/proxmox-live-preview-ai-image.webp)

As a web developer, providing clients with live previews of websites in development is crucial for feedback and collaboration. This post outlines how I've streamlined this process by leveraging a local Proxmox server to host a dedicated live preview environment. The setup uses a Debian 11 container running Nginx and ngrok, which serves as a remote host for the current version of the project files. Development and coding still happen on my main PC, and the files are automatically synchronized to the container for clients to view.

***

### Setting up the Debian 11 Container in Proxmox

1.  **Download a Debian 11 Template:** In your Proxmox web interface, navigate to your local storage and then to **CT Templates**. Click on **Templates** and search for "debian". Download a "debian-11-standard" template.
2.  **Create a New Container:** Click the **Create CT** button in the top right corner.
3.  **General:** Give your container a hostname (e.g., `dev-server`) and set a secure password.
4.  **Template:** Select the "debian-11-standard" template you downloaded.
5.  **Storage:** Choose where you want to store the container's disk.
6.  **Disk:** Allocate appropriate disk space. For a basic web development environment, 32GB should suffice.
7.  **CPU:** Assign at least 1 CPU core and adjust as needed.
8.  **Memory:** Allocate at least 1GB of RAM.
9.  **Network:** Configure the network settings. To ensure a consistent address, you'll want to assign a **static IP address**. I accomplished this by reserving an IPv4 address for the container's MAC address in my router's settings and then configuring the network settings for the container itself.
10. **Confirm:** Review your settings and click **Create**.

After creation, start the container and open the console to proceed with the initial configuration.

***

### System Architecture Overview

Here's a visual representation of how all the components work together:

![Live Preview Environment Setup](../Gallery/Blog-images/proxmox-live-preview-setup.webp)

***

### Installing and Configuring Nginx

After installing Nginx, it's configured to serve a default page from `/var/www/html`. To host your project, you'll create a custom configuration file, also known as a **server block**.

1.  **Create the Server Block File:**
    Navigate to the `sites-available` directory in the Nginx configuration folder. This is where you'll store all your potential site configurations.
    `cd /etc/nginx/sites-available/`
    Now, create a new file for your project using a text editor like `nano`. It's a good practice to name the file after your project to keep things organized.
    `sudo nano your-project-name`

2.  **Add Configuration Directives:**
    Inside this new file, you'll add the server block. A basic configuration for your project might look like this:

    ```nginx
    server {
        listen 80;
        listen [::]:80;

        root /var/www/html/your-project-name;
        index index.html index.htm;

        server_name your-static-IP or your-domain.com;

        location / {
            try_files $uri $uri/ =404;
        }
    }
    ```

    * `listen 80;`: This tells Nginx to listen for incoming connections on port 80, the standard HTTP port.
    * `root /var/www/html/your-project-name;`: This is the most important part. It defines the **root directory** where your website's files are located. You should change `/var/www/html/your-project-name` to the actual path where you're syncing your project files.
    * `index index.html index.htm;`: This specifies which files Nginx should look for as the default page when a directory is requested.
    * `server_name your-static-IP or your-domain.com;`: This is the domain name or IP address that this server block should respond to. For your local setup, you can use the container's static IP address.
    * `location / { ... }`: This block handles requests to the root of your site and ensures files are served correctly.

3.  **Enable the Server Block:**
    Nginx only uses configuration files located in the `sites-enabled` directory. To tell Nginx to use your new server block, you'll create a **symbolic link** from your file in `sites-available` to `sites-enabled`. Think of a symbolic link as a shortcut.
    `sudo ln -s /etc/nginx/sites-available/your-project-name /etc/nginx/sites-enabled/`

4.  **Remove the Default Nginx Configuration:**
    The default Nginx server block also listens on port 80, which can conflict with your new configuration. It's best to remove or disable it.
    `sudo rm /etc/nginx/sites-enabled/default`

5.  **Test and Restart Nginx:**
    Before restarting, always test your configuration for syntax errors.
    `sudo nginx -t`
    If the test is successful, you'll see a message like "test is successful". Now, restart Nginx to apply your changes.
    `sudo systemctl restart nginx`

***

### Installing and Running ngrok

ngrok allows you to expose your local web server to the internet through secure tunnels. This is essential for sharing the live preview with clients who are not on your local network.

1.  **Download ngrok:** Visit the [ngrok download page](https://ngrok.com/download) and get the Linux version appropriate for your container's architecture.
2.  **Unzip ngrok:**
    `unzip ngrok-stable-linux-amd64.zip` (replace with the actual filename)
3.  **Connect your Account (Optional but Recommended):** Sign up for a free ngrok account to get an authtoken. Then, run:
    `./ngrok authtoken YOUR_AUTHTOKEN` (replace `YOUR_AUTHTOKEN` with your actual token).
4.  **Run ngrok:** To expose your Nginx server (typically running on port 80), use the command:
    `./ngrok http 80`

ngrok will provide you with a public URL that you can share with your clients. Keep this terminal session running while you need the live preview.

***

### Automating File Synchronization from Your PC to the Container

To streamline the process of updating the website files on the container, I've implemented an automated synchronization using **WinSCP** and a simple batch file. This allows me to easily transfer the latest project files from my development PC to the container. The most secure way to do this is with **SSH keys**.

#### Generating and Using SSH Keys

1.  **Generate a Key Pair on Your PC:** Open PuTTYgen (which comes with WinSCP) or a similar tool.
2.  **Generate a Public and Private Key:** Click the **Generate** button and move your mouse around to create randomness. Save both the private key (`id_rsa.ppk` is a common format) to a secure location on your PC and copy the public key to your clipboard.
3.  **Add the Public Key to the Container:**
    * Log into your Debian container via SSH.
    * Navigate to the `.ssh` directory of your user: `cd ~/.ssh`. If this directory doesn't exist, create it: `mkdir ~/.ssh`.
    * Create or edit the `authorized_keys` file: `nano authorized_keys`.
    * Paste the public key you copied earlier into this file and save it.
    * Set the correct permissions for the `.ssh` directory and `authorized_keys` file:
        `chmod 700 ~/.ssh`
        `chmod 600 ~/.ssh/authorized_keys`

With the key pair set up, you no longer need a password for SSH access from your PC.

#### Creating the WinSCP Script (`Upload_script.scp`)

The WinSCP script automates the process of connecting to the container via SFTP, synchronizing files, and then closing the connection. By using an SSH key, you can remove the password from the script entirely.

```
open sftp://your_username@your_static_IP:22/ -privatekey="C:\path\to\your\private_key.ppk"
synchronize remote -filemask="|desktop.ini; *.scp" -delete "your_local_project_path" /var/www/html/your-project-name
close
exit
```

* `open sftp://your_username@your_static_IP:22/ -privatekey="C:\path\to\your\private_key.ppk"`: This command establishes an SFTP connection. The `-privatekey` flag points to the location of the private key on your PC, removing the need for a password.
* `synchronize remote -filemask="|desktop.ini; *.scp" -delete "your_local_project_path" /var/www/html/your-project-name`: This is the core synchronization command.
    * `synchronize remote`: Specifies a one-way synchronization from the local source to the remote destination.
    * `-filemask="|desktop.ini; *.scp"`: This filter excludes files named `desktop.ini` and any files with the `.scp` extension from the synchronization, preventing the transfer of unnecessary system files or the script itself.
    * `-delete`: This option ensures that any files deleted from the local directory on your PC are also deleted from the remote directory on the container.
    * `"your_local_project_path"`: This is the local source directory on your development machine.
    * `/var/www/html/your-project-name`: This is the remote destination directory on the Debian container where the website files are stored.
* `close`: Closes the SFTP connection.
* `exit`: Exits the WinSCP application.

**Creating the Batch File:**

The batch file simplifies running the WinSCP script:

```
"C:\Program Files (x86)\WinSCP\WinSCP.com" /script="your_local_script_path\Upload_script.scp"

pause
```

The first line executes the WinSCP command-line interface, instructing it to run the specified script.

**The Role of `pause`:**

The `pause` command in the batch file is crucial for reviewing the output of the WinSCP synchronization process. When the script finishes executing, the command prompt window will remain open, displaying any messages or errors generated by WinSCP during the file transfer. This allows you to quickly verify which files were successfully synchronized and check for any potential issues before the command prompt window closes automatically.

***

### Setting up SSH via PowerShell in Windows

PowerShell on Windows can also be used to directly interact with your Debian container via SSH.

1.  **Open PowerShell:** Search for "PowerShell" in the Start Menu and open it.
2.  **Connect via SSH:** Use the `ssh` command followed by the username and IP address of your container:
    `ssh your_username@your_static_IP`
3.  **Enter Password:** You will be prompted to enter the password for the specified user.

Once authenticated, you will have a terminal session on your Debian container, allowing you to execute commands directly.

***

### Conclusion

This setup provides a robust and efficient workflow for developing and previewing websites. By leveraging Proxmox for virtualization, Debian for a stable server environment, Nginx for serving web content, and ngrok for secure external access, developers can easily showcase their work to clients. The automation of file synchronization through WinSCP further streamlines the development process, allowing for more focus on building great websites. Remember to prioritize security best practices, such as using SSH keys for authentication, especially in more sensitive environments.
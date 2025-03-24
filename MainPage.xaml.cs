using System;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Microsoft.Maui.Controls;

namespace BibleDrillsPracticeWV;

public partial class MainPage : ContentPage
{
    private HttpListener? _httpListener;
    private string? _localServerUrl;

    public MainPage()
    {
        InitializeComponent();
        StartLocalServer();
        CopyAssetsToAppData();
    }

    private async void StartLocalServer()
    {

        _localServerUrl = "http://localhost:8080/";

        _httpListener = new HttpListener();
        _httpListener.Prefixes.Add(_localServerUrl);
        _httpListener.Start();

        Console.WriteLine("Local server running at: " + _localServerUrl);

        _ = Task.Run(async () =>
        {
            while (_httpListener.IsListening)
            {
                var context = await _httpListener.GetContextAsync();
                var response = context.Response;

                string requestedFile = context.Request.Url?.AbsolutePath.TrimStart('/') ?? "index.html";

                if (string.IsNullOrEmpty(requestedFile))
                    requestedFile = "index.html"; // Default file

                string filePath = Path.Combine(FileSystem.AppDataDirectory, requestedFile);
                if (File.Exists(filePath))
                {
                    byte[] fileBytes = File.ReadAllBytes(filePath);
                    response.ContentType = GetMimeType(requestedFile);
                    response.OutputStream.Write(fileBytes, 0, fileBytes.Length);
                }
                else
                {
                    response.StatusCode = 404;
                }

                response.OutputStream.Close();
            }
        });

        await Task.Delay(1000); // Ensure server is running
        //webView.Source = _localServerUrl + "index.html"; // Load via HTTP
        webView.Source = _localServerUrl + "index.html?v=" + DateTime.Now.Ticks; // Cache busting
    }

    private static string GetMimeType(string fileName)
    {
        return fileName.EndsWith(".js") ? "application/javascript"
             : fileName.EndsWith(".css") ? "text/css"
             : fileName.EndsWith(".html") ? "text/html"
             : "application/octet-stream";
    }
    private void CopyAssetsToAppData()
    {
        string[] files = {
        "index.html", "main.js", "styles.css",
        "json/bibleVerses.json", "json/keyPassages.json", "json/bibleBooks.json"
    };

        foreach (var file in files)
        {
            string destinationPath = Path.Combine(FileSystem.AppDataDirectory, file);

            Directory.CreateDirectory(Path.GetDirectoryName(destinationPath) ?? FileSystem.AppDataDirectory);

            using var stream = FileSystem.OpenAppPackageFileAsync(file).Result;
            using var reader = new StreamReader(stream);
            File.WriteAllText(destinationPath, reader.ReadToEnd()); // Overwrite files every time
        }
    }
}
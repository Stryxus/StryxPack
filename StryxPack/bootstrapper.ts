import { setDebugMode, __project_introduction } from "./globals";

(async () =>
{
    console.clear();
    console.log(__project_introduction);

    process.argv.forEach(item =>
    {
        switch (item)
        {
            case 'build:debug': ;
                setDebugMode();
                break;
        }
    });
})();
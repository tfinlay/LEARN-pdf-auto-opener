import './css/popup.scss'
import {
    Backdrop,
    Box,
    Container,
    createMuiTheme, Link,
    MuiThemeProvider,
    Paper,
    Typography,
    useMediaQuery
} from "@material-ui/core";
import React, {useEffect, useState} from 'react';
import {Settings} from "./Settings";
import {Share} from "./Share";
import {browser} from "webextension-polyfill-ts";
import {LOCAL_KEYS} from "../constant";

export const DefaultPopup: React.FC = () => {
    const prefersDarkMode = useMediaQuery(`(prefers-color-scheme: dark)`)

    const [workCount, setWorkCount] = useState<number | null>(null)

    useEffect(() => {
        (async () => {
            const res = await browser.storage.local.get(LOCAL_KEYS.WORK_COUNT)
            console.log(res)
            setWorkCount(
                res[LOCAL_KEYS.WORK_COUNT] ?? null
            )
        })()
    }, [])

    const theme = React.useMemo(() => (
        createMuiTheme({
            palette: {
                type: prefersDarkMode ? 'dark' : 'light',
            }
        })
    ), [prefersDarkMode])

    return (
        <MuiThemeProvider theme={theme}>
            <Paper style={{padding: 10}}>
                <Box component="div">
                    <Typography variant="h4">LEARN PDF Auto-Opener</Typography>
                </Box>

                {(workCount === null) ? undefined : (
                    <Box>
                        <Typography variant="subtitle1">
                            So far, we've opened {workCount} PDFs for you!
                        </Typography>
                    </Box>
                )}

                <Box component="div" style={{paddingTop: 10}}>
                    <Share/>
                </Box>

                <Box component="div" style={{paddingTop: 10}}>
                    <Settings/>
                </Box>

                <Box component="div" style={{paddingTop: 8}}>
                    <Typography variant="body2">
                        Made with ❤ by <Link variant="inherit" color="inherit" href="https://github.com/tfinlay" target="_blank" rel="noopener noreferrer">Thomas Finlay</Link>
                    </Typography>
                </Box>
            </Paper>
        </MuiThemeProvider>
    )
}
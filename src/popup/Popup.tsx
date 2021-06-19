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
import React from 'react';
import {Settings} from "./Settings";

export const Popup: React.FC = () => {
    const prefersDarkMode = useMediaQuery(`(prefers-color-scheme: dark)`)

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
                    <Typography variant="h3">LEARN PDF Auto-Opener</Typography>
                </Box>

                <Box component="div" style={{paddingTop: 10}}>
                    <Settings/>
                </Box>

                <Box component="div" style={{paddingTop: 8}}>
                    <Typography variant="body2">
                        Made with ❤ by <Link variant="inherit" color="inherit" href="https://github.com/tfinlay">Thomas Finlay</Link>
                    </Typography>
                </Box>
            </Paper>
        </MuiThemeProvider>
    )
}
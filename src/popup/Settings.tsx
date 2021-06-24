import React, {useCallback, useState} from "react";
import {
    Card,
    CardContent,
    Checkbox, Dialog, DialogContent, DialogTitle,
    FormControlLabel,
    InputLabel, Link,
    Paper,
    Snackbar,
    Typography
} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import {observer, useLocalObservable, useLocalStore} from "mobx-react-lite";
import {SettingsStore} from "./SettingsStore";

export const Settings = observer(() => {
    const store = useLocalObservable<SettingsStore>(() => new SettingsStore())
    const [showingAnalyticsDetails, setAnalyticsDetailShowing] = useState<boolean>(false)

    const setEmbeddedCallback = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        await store.setExpandEmbedded(event.target.checked)
    }, [store])

    const setOpenForcedDownloads = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        await store.setOpenForcedDownloads(event.target.checked)
    }, [store])

    const setShowingAnalytics = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        await store.setAnalytics(event.target.checked)
    }, [store])

    const handleSnackbarClose = useCallback((event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        store.resetHasMadeSettingsChanges()
    }, [store])

    const handleAnalyticsDetailsClose = useCallback(async (event: React.SyntheticEvent | React.MouseEvent, reason?: string) => {
        setAnalyticsDetailShowing(false)
    }, [setAnalyticsDetailShowing])

    const handleAnalyticsDetailsOpen = useCallback( (event: React.MouseEvent) => {
        setAnalyticsDetailShowing(true)
    }, [setAnalyticsDetailShowing])

    return (
        <>
            <Card variant="outlined">
                <CardContent>
                    <Typography variant="h5">Settings</Typography>
                    <SettingsRow title="Expand embedded PDFs" onChange={setEmbeddedCallback} value={store.expandEmbedded}/>
                    <SettingsRow title="Open PDFs instead of downloading" onChange={setOpenForcedDownloads} value={store.openForcedDownloads}/>
                    <SettingsRow
                        title={"Allow analytics reporting"}
                        onChange={setShowingAnalytics}
                        value={store.analytics}
                    />
                    <div style={{marginLeft: 30}}><Link color="secondary" style={{cursor: "pointer"}} onClick={handleAnalyticsDetailsOpen}>Analytics Details & Privacy Policy</Link></div>
                </CardContent>
            </Card>

            <Snackbar
                open={store.hasMadeSettingsChanges}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center'
                }}
                onClose={handleSnackbarClose}
                autoHideDuration={6000}
                message={
                    <Typography variant="body1">
                        Changes saved. Please note that it may take take a few seconds for these changes to process.
                    </Typography>
                }
            />

            <Dialog
                open={showingAnalyticsDetails}
                onClose={handleAnalyticsDetailsClose}
            >
                <DialogTitle>Analytics Reporting Information</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">
                        <p>Anonymous analytics logging events are triggered whenever this extension helps you open a PDF.</p>
                        <p>
                            No information about you or the PDF are recorded beyond perhaps your IP address, system information,
                            the time at which the request was made, and how the extension helped you (for example, whether it expanded an
                            embedded PDF or opened a PDF instead of downloading it).
                        </p>

                        <p>
                            Information collected is for analytics purposes only. You may opt out at any time,
                            however pre-recorded data will remain (since it cannot be linked to you to be deleted).
                        </p>

                        <p>Analytics are provided by Google Analytics.</p>
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    )
})

interface SettingsRowProps {
    title: React.ReactNode
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
    value: boolean | undefined
}
const SettingsRow = ({title, onChange, value}: SettingsRowProps) => {
    const content = (
        <Typography variant="body1">
            <FormControlLabel
                control={(
                    <Checkbox
                        checked={value}
                        onChange={onChange}
                        name={`${title.toString()}`}
                    />
                )}
                label={title}
            />
        </Typography>
    )

    if (value === undefined) {
        return <Skeleton title={`Loading ${title} setting...`}>content</Skeleton>
    } else {
        return content
    }
}
﻿import {SourceStaffEntry} from "../VoiceData/SourceStaffEntry";
import {BoundingBox} from "./BoundingBox";
import {Fraction} from "../../Common/DataObjects/fraction";
import {VerticalGraphicalStaffEntryContainer} from "./VerticalGraphicalStaffEntryContainer";
import {Note} from "../VoiceData/Note";
import {Slur} from "../VoiceData/Expressions/ContinuousExpressions/Slur";
import {Voice} from "../VoiceData/Voice";
import {VoiceEntry} from "../VoiceData/VoiceEntry";
import {LinkedVoice} from "../VoiceData/LinkedVoice";
import {GraphicalTie} from "./GraphicalTie";
import {GraphicalObject} from "./GraphicalObject";
import {StaffMeasure} from "./StaffMeasure";
import {GraphicalNote} from "./GraphicalNote";
import {GraphicalChordSymbolContainer} from "./GraphicalChordSymbolContainer";
import {GraphicalLyricEntry} from "./GraphicalLyricEntry";
import {AbstractGraphicalInstruction} from "./AbstractGraphicalInstruction";
import {GraphicalStaffEntryLink} from "./GraphicalStaffEntryLink";

export class GraphicalStaffEntry extends GraphicalObject {
    constructor(parentMeasure: StaffMeasure, sourceStaffEntry: SourceStaffEntry = undefined, staffEntryParent: GraphicalStaffEntry = undefined) {
        this.parentMeasure = parentMeasure;
        this.notes = [];
        this.graceStaffEntriesBefore = [];
        this.graceStaffEntriesAfter = [];
        this.sourceStaffEntry = sourceStaffEntry;
        if (staffEntryParent !== undefined) {
            this.staffEntryParent = staffEntryParent;
            this.parentVerticalContainer = staffEntryParent.parentVerticalContainer;
            this.PositionAndShape = new BoundingBox(staffEntryParent.PositionAndShape, this);
        } else {
            this.PositionAndShape = new BoundingBox(parentMeasure.PositionAndShape, this);
        }
        if (sourceStaffEntry !== undefined) {
            this.relInMeasureTimestamp = sourceStaffEntry.Timestamp;
        }
    }

    public graphicalChordContainer: GraphicalChordSymbolContainer;
    public graphicalLink: GraphicalStaffEntryLink;
    public relInMeasureTimestamp: Fraction;
    public sourceStaffEntry: SourceStaffEntry;
    public parentMeasure: StaffMeasure;
    public notes: GraphicalNote[][];
    public graceStaffEntriesBefore: GraphicalStaffEntry[];
    public graceStaffEntriesAfter: GraphicalStaffEntry[];
    public staffEntryParent: GraphicalStaffEntry;
    public parentVerticalContainer: VerticalGraphicalStaffEntryContainer;

    private graphicalInstructions: AbstractGraphicalInstruction[] = [];
    private graphicalTies: GraphicalTie[] = [];
    private lyricsEntries: GraphicalLyricEntry[] = [];

    public get GraphicalInstructions(): AbstractGraphicalInstruction[] {
        return this.graphicalInstructions;
    }

    public get GraphicalTies(): GraphicalTie[] {
        return this.graphicalTies;
    }

    public get LyricsEntries(): GraphicalLyricEntry[] {
        return this.lyricsEntries;
    }

    public getAbsoluteTimestamp(): Fraction {
        let result: Fraction = Fraction.createFromFraction(this.parentMeasure.parentSourceMeasure.AbsoluteTimestamp);
        if (this.relInMeasureTimestamp !== undefined) {
            result += this.relInMeasureTimestamp;
        }
        return result;
    }

    public findEndTieGraphicalNoteFromNote(tieNote: Note): GraphicalNote {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                let note: Note = graphicalNote.sourceNote;
                if (
                    note.Pitch !== undefined && note.Pitch.FundamentalNote === tieNote.Pitch.FundamentalNote
                    && note.Pitch.Octave === tieNote.Pitch.Octave && note.getAbsoluteTimestamp() === tieNote.getAbsoluteTimestamp()
                ) {
                    return graphicalNote;
                }
            }
        }
        return undefined;
    }

    public findEndTieGraphicalNoteFromNoteWithStartingSlur(tieNote: Note, slur: Slur): GraphicalNote {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                let note: Note = graphicalNote.sourceNote;
                if (note.NoteTie !== undefined && note.NoteSlurs.indexOf(slur) !== -1) {
                    return graphicalNote;
                }
            }
        }
        return undefined;
    }

    public findEndTieGraphicalNoteFromNoteWithEndingSlur(tieNote: Note): GraphicalNote {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                let note: Note = graphicalNote.sourceNote;
                if (
                    note.Pitch !== undefined && note.Pitch.FundamentalNote === tieNote.Pitch.FundamentalNote
                    && note.Pitch.Octave === tieNote.Pitch.Octave && this.getAbsoluteTimestamp() === tieNote.getAbsoluteTimestamp()
                ) {
                    return graphicalNote;
                }
            }
        }
        return undefined;
    }

    public findGraphicalNoteFromGraceNote(graceNote: Note): GraphicalNote {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                if (graphicalNote.sourceNote === graceNote) {
                    return graphicalNote;
                }
            }
        }
        return undefined;
    }

    public findGraphicalNoteFromNote(baseNote: Note): GraphicalNote {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                if (graphicalNote.sourceNote === baseNote && this.getAbsoluteTimestamp() === baseNote.getAbsoluteTimestamp()) {
                    return graphicalNote;
                }
            }
        }
        return undefined;
    }

    public getGraphicalNoteDurationFromVoice(voice: Voice): Fraction {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            if (graphicalNotes[0].sourceNote.ParentVoiceEntry.ParentVoice === voice) {
                return graphicalNotes[0].graphicalNoteLength;
            }
        }
        return new Fraction(0, 1);
    }

    public findLinkedNotes(notLinkedNotes: GraphicalNote[]): void {
        if (this.sourceStaffEntry !== undefined && this.sourceStaffEntry.Link !== undefined) {
            for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
                let graphicalNotes: GraphicalNote[] = this.notes[idx];
                for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                    let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                    if (graphicalNote.parentStaffEntry === this) {
                        notLinkedNotes.push(graphicalNote);
                    }
                }
            }
        }
    }

    public findVoiceEntryGraphicalNotes(voiceEntry: VoiceEntry): GraphicalNote[] {
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                if (graphicalNote.sourceNote.ParentVoiceEntry === voiceEntry) {
                    return graphicalNotes;
                }
            }
        }
        return undefined;
    }

    public isVoiceEntryPartOfLinkedVoiceEntry(voiceEntry: VoiceEntry): boolean {
        if (this.sourceStaffEntry.Link !== undefined) {
            for (let idx: number = 0, len: number = this.sourceStaffEntry.Link.LinkStaffEntries.length; idx < len; ++idx) {
                let sEntry: SourceStaffEntry = this.sourceStaffEntry.Link.LinkStaffEntries[idx];
                if (sEntry.VoiceEntries.indexOf(voiceEntry) !== -1 && sEntry !== this.sourceStaffEntry) {
                    return true;
                }
            }
        }
        return false;
    }

    public getMainVoice(): Voice {
        for (let idx: number = 0, len: number = this.sourceStaffEntry.VoiceEntries.length; idx < len; ++idx) {
            let voiceEntry: VoiceEntry = this.sourceStaffEntry.VoiceEntries[idx];
            if (voiceEntry.ParentVoice.GetType() !== /*typeof*/LinkedVoice) {
                return voiceEntry.ParentVoice;
            }
        }
        return this.notes[0][0].sourceNote.ParentVoiceEntry.ParentVoice;
    }

    public findStaffEntryMinNoteLength(): Fraction {
        let minLength: Fraction = new Fraction(Number.MAX_VALUE, 1);
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                let calNoteLen: Fraction = graphicalNote.graphicalNoteLength;
                if (calNoteLen < minLength && calNoteLen.Numerator > 0) {
                    minLength = calNoteLen;
                }
            }
        }
        return minLength;
    }

    public findStaffEntryMaxNoteLength(): Fraction {
        let maxLength: Fraction = new Fraction(0, 1);
        for (let idx: number = 0, len: number = this.notes.length; idx < len; ++idx) {
            let graphicalNotes: GraphicalNote[] = this.notes[idx];
            for (let idx2: number = 0, len2: number = graphicalNotes.length; idx2 < len2; ++idx2) {
                let graphicalNote: GraphicalNote = graphicalNotes[idx2];
                let calNoteLen: Fraction = graphicalNote.graphicalNoteLength;
                if (calNoteLen > maxLength && calNoteLen.Numerator > 0) {
                    maxLength = calNoteLen;
                }
            }
        }
        return maxLength;
    }

    public findOrCreateGraphicalNotesListFromVoiceEntry(voiceEntry: VoiceEntry): GraphicalNote[] {
        let graphicalNotes: GraphicalNote[];
        if (this.notes.length === 0) {
            graphicalNotes = [];
            this.notes.push(graphicalNotes);
        } else {
            for (let i: number = 0; i < this.notes.length; i++) {
                if (this.notes[i][0].sourceNote.ParentVoiceEntry.ParentVoice === voiceEntry.ParentVoice) {
                    return this.notes[i];
                }
            }
            graphicalNotes = [];
            this.notes.push(graphicalNotes);
        }
        return graphicalNotes;
    }

    public findOrCreateGraphicalNotesListFromGraphicalNote(graphicalNote: GraphicalNote): GraphicalNote[] {
        let graphicalNotes: GraphicalNote[];
        let tieStartSourceStaffEntry: SourceStaffEntry = graphicalNote.sourceNote.ParentStaffEntry;
        if (this.sourceStaffEntry !== tieStartSourceStaffEntry) {
            graphicalNotes = this.findOrCreateGraphicalNotesListFromVoiceEntry(graphicalNote.sourceNote.ParentVoiceEntry);
        } else {
            if (this.notes.length === 0) {
                graphicalNotes = [];
                this.notes.push(graphicalNotes);
            } else {
                for (let i: number = 0; i < this.notes.length; i++) {
                    if (this.notes[i][0].sourceNote.ParentVoiceEntry.ParentVoice === graphicalNote.sourceNote.ParentVoiceEntry.ParentVoice) {
                        return this.notes[i];
                    }
                }
                graphicalNotes = [];
                this.notes.push(graphicalNotes);
            }
        }
        return graphicalNotes;
    }

    public addGraphicalNoteToListAtCorrectYPosition(graphicalNotes: GraphicalNote[], graphicalNote: GraphicalNote): void {
        if (graphicalNotes.length === 0 || graphicalNote.PositionAndShape.RelativePosition.y < graphicalNotes.Last().PositionAndShape.RelativePosition.Y) {
            graphicalNotes.push(graphicalNote);
        } else {
            for (let i: number = graphicalNotes.length - 1; i >= 0; i--) {
                if (graphicalNotes[i].PositionAndShape.RelativePosition.y > graphicalNote.PositionAndShape.RelativePosition.y) {
                    graphicalNotes.splice(i + 1, 0, graphicalNote);
                    break;
                }
                if (i === 0) {
                    graphicalNotes.splice(0, 0, graphicalNote);
                    break;
                }
            }
        }
    }
}
